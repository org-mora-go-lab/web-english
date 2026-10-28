import "server-only";

import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";

import argon2 from "argon2";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/src/5-shared/db";

const emailSchema = z.email().max(254).transform((value) => value.trim().toLowerCase());
const passwordSchema = z.string().min(12).max(128).regex(/[a-z]/i).regex(/\d/).regex(/[^a-z\d]/i);

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  passwordConfirmation: z.string(),
  displayName: z.string().trim().min(2).max(40),
}).refine((value) => value.password === value.passwordConfirmation, { path: ["passwordConfirmation"], message: "비밀번호가 일치하지 않습니다." });

export const passwordChangeSchema = z.object({
  currentPassword: z.string(),
  newPassword: passwordSchema,
});

export const resetSchema = z.object({ token: z.string().min(20), password: passwordSchema });

export function normalizeEmail(value: string) {
  return emailSchema.parse(value);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newToken() {
  return randomBytes(32).toString("base64url");
}

export function publicUser(user: typeof schema.users.$inferSelect) {
  return { id: user.id, email: user.email, displayName: user.displayName, role: user.role, status: user.status };
}

export async function findUserByEmail(email: string) {
  return getDb().query.users.findFirst({ where: eq(schema.users.email, email) });
}

export async function findUserById(id: string) {
  return getDb().query.users.findFirst({ where: eq(schema.users.id, id) });
}

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export async function checkRateLimit(request: Request, action: string, identifier: string, limit: number, windowMs: number) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = createHmac("sha256", secret).update(`${action}:${ip}:${identifier}`).digest("hex");
  const now = Date.now();
  await getDb().run(sql`INSERT INTO rate_limits (key, count, expires_at) VALUES (${key}, 1, ${now + windowMs})
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN expires_at <= ${now} THEN 1 ELSE count + 1 END,
      expires_at = CASE WHEN expires_at <= ${now} THEN ${now + windowMs} ELSE expires_at END`);
  const row = await getDb().query.rateLimits.findFirst({ where: eq(schema.rateLimits.key, key) });
  return (row?.count ?? 0) <= limit;
}

function emailConfigReady() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM) ||
    (process.env.NODE_ENV !== "production" && Boolean(process.env.EMAIL_CAPTURE_DIR));
}

async function sendEmail(to: string, subject: string, url: string) {
  if (process.env.NODE_ENV !== "production" && process.env.EMAIL_CAPTURE_DIR) {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    await mkdir(process.env.EMAIL_CAPTURE_DIR, { recursive: true });
    await writeFile(join(process.env.EMAIL_CAPTURE_DIR, `${Date.now()}-${randomUUID()}.json`), JSON.stringify({ to, subject, url }));
    return;
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Email delivery is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text: `${subject}\n\n${url}\n\n이 링크는 일정 시간이 지나면 만료됩니다.` }),
  });
  if (!response.ok) throw new Error(`Email delivery failed: ${response.status}`);
}

function appUrl(path: string) {
  const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!base) throw new Error("AUTH_URL is required");
  return new URL(path, base).toString();
}

export async function register(input: z.infer<typeof signupSchema>) {
  if (!emailConfigReady()) throw new Error("Email delivery is not configured");
  const db = getDb();
  const existing = await findUserByEmail(input.email);
  if (existing?.status === "active" || existing?.status === "disabled") return;
  const token = newToken();
  const now = Date.now();
  let userId = existing?.id;
  if (!existing) {
    userId = randomUUID();
    await db.insert(schema.users).values({
      id: userId, email: input.email, displayName: input.displayName,
      passwordHash: await hashPassword(input.password), role: "user", status: "pending",
      createdAt: now, updatedAt: now,
    });
  } else {
    await db.update(schema.users).set({ displayName: input.displayName, passwordHash: await hashPassword(input.password), updatedAt: now }).where(eq(schema.users.id, existing.id));
    await db.delete(schema.verificationTokens).where(and(eq(schema.verificationTokens.userId, existing.id), eq(schema.verificationTokens.purpose, "signup")));
  }
  await db.insert(schema.verificationTokens).values({
    id: randomUUID(), userId: userId!, tokenHash: hashToken(token), purpose: "signup", expiresAt: now + 24 * 60 * 60_000,
  });
  await sendEmail(input.email, "Mora English 이메일 인증", appUrl(`/verify-email?token=${token}`));
}

export async function verifyEmail(token: string) {
  const db = getDb();
  const now = Date.now();
  const record = await db.query.verificationTokens.findFirst({ where: and(eq(schema.verificationTokens.tokenHash, hashToken(token)), isNull(schema.verificationTokens.consumedAt), gt(schema.verificationTokens.expiresAt, now)) });
  if (!record) return false;
  return db.transaction(async (tx) => {
    const consumed = await tx.update(schema.verificationTokens).set({ consumedAt: now }).where(and(eq(schema.verificationTokens.id, record.id), isNull(schema.verificationTokens.consumedAt))).returning({ id: schema.verificationTokens.id });
    if (!consumed.length) return false;
    if (record.purpose === "email_change") {
      if (!record.pendingEmail) return false;
      const exists = await tx.query.users.findFirst({ where: eq(schema.users.email, record.pendingEmail) });
      if (exists && exists.id !== record.userId) return false;
      await tx.update(schema.users).set({ email: record.pendingEmail, emailVerifiedAt: now, updatedAt: now, sessionVersion: sql`${schema.users.sessionVersion} + 1` }).where(eq(schema.users.id, record.userId));
    } else {
      await tx.update(schema.users).set({ status: "active", emailVerifiedAt: now, updatedAt: now }).where(and(eq(schema.users.id, record.userId), eq(schema.users.status, "pending")));
    }
    return true;
  });
}

export async function requestPasswordReset(email: string) {
  if (!emailConfigReady()) throw new Error("Email delivery is not configured");
  const user = await findUserByEmail(email);
  if (!user || user.status !== "active") return;
  const token = newToken();
  await getDb().insert(schema.passwordResetTokens).values({ id: randomUUID(), userId: user.id, tokenHash: hashToken(token), expiresAt: Date.now() + 60 * 60_000 });
  await sendEmail(email, "Mora English 비밀번호 재설정", appUrl(`/reset-password?token=${token}`));
}

export async function resetPassword(token: string, password: string) {
  const db = getDb();
  const now = Date.now();
  const record = await db.query.passwordResetTokens.findFirst({ where: and(eq(schema.passwordResetTokens.tokenHash, hashToken(token)), isNull(schema.passwordResetTokens.consumedAt), gt(schema.passwordResetTokens.expiresAt, now)) });
  if (!record) return false;
  const passwordHash = await hashPassword(password);
  return db.transaction(async (tx) => {
    const consumed = await tx.update(schema.passwordResetTokens).set({ consumedAt: now }).where(and(eq(schema.passwordResetTokens.id, record.id), isNull(schema.passwordResetTokens.consumedAt))).returning({ id: schema.passwordResetTokens.id });
    if (!consumed.length) return false;
    await tx.update(schema.users).set({ passwordHash, updatedAt: now, sessionVersion: sql`${schema.users.sessionVersion} + 1` }).where(eq(schema.users.id, record.userId));
    return true;
  });
}

export async function requestEmailChange(userId: string, email: string) {
  if (!emailConfigReady()) throw new Error("Email delivery is not configured");
  const existing = await findUserByEmail(email);
  if (existing) return;
  const token = newToken();
  await getDb().insert(schema.verificationTokens).values({ id: randomUUID(), userId, tokenHash: hashToken(token), purpose: "email_change", pendingEmail: email, expiresAt: Date.now() + 24 * 60 * 60_000 });
  await sendEmail(email, "Mora English 새 이메일 인증", appUrl(`/verify-email?token=${token}`));
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await findUserById(userId);
  if (!user || !(await verifyPassword(user.passwordHash, currentPassword))) return false;
  await getDb().update(schema.users).set({ passwordHash: await hashPassword(newPassword), updatedAt: Date.now(), sessionVersion: user.sessionVersion + 1 }).where(eq(schema.users.id, userId));
  return true;
}
