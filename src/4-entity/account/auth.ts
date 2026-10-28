import "server-only";

import argon2 from "argon2";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { checkRateLimit, findUserByEmail, findUserById, verifyPassword } from "./server";

// A fixed valid hash keeps unknown-email and bad-password paths similar in cost.
const dummyHash = argon2.hash("not-a-real-account-password", { type: argon2.argon2id });

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials, request) {
      const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
      const password = typeof credentials.password === "string" ? credentials.password : "";
      if (!email || !password) return null;
      if (!(await checkRateLimit(request, "login", email, 10, 15 * 60_000))) return null;
      const user = await findUserByEmail(email);
      const valid = await verifyPassword(user?.passwordHash ?? await dummyHash, password);
      if (!valid || !user || user.status !== "active" || !user.emailVerifiedAt) return null;
      return { id: user.id, email: user.email, name: user.displayName, role: user.role, sessionVersion: user.sessionVersion };
    },
  })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.userId ?? "");
      session.user.sessionVersion = Number(token.sessionVersion ?? -1);
      return session;
    },
  },
});

export async function getActor() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await findUserById(session.user.id);
  if (!user || user.status !== "active" || user.sessionVersion !== session.user.sessionVersion) return null;
  return user;
}
