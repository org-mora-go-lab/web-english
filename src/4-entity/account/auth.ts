import "server-only";

import argon2 from "argon2";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Kakao from "next-auth/providers/kakao";

import { checkRateLimit, findUserByEmail, findUserById, upsertKakaoUser, verifyPassword } from "./server";

// A fixed valid hash keeps unknown-email and bad-password paths similar in cost.
const dummyHash = argon2.hash("not-a-real-account-password", { type: argon2.argon2id });
export const kakaoEnabled = Boolean(process.env.AUTH_KAKAO_ID && process.env.AUTH_KAKAO_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-web-english.session-token" : "web-english.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
  },
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
      if (!valid || !user || user.kakaoId || user.status !== "active") return null;
      return { id: user.id, email: user.email, name: user.displayName, role: user.role, sessionVersion: user.sessionVersion };
    },
  }), ...(kakaoEnabled ? [Kakao({
    clientId: process.env.AUTH_KAKAO_ID!,
    clientSecret: process.env.AUTH_KAKAO_SECRET!,
    authorization: { url: "https://kauth.kakao.com/oauth/authorize", params: { scope: "profile_nickname,profile_image" } },
    profile(profile) {
      const kakao = profile as { id: number | string; kakao_account?: { profile?: { nickname?: string; profile_image_url?: string; thumbnail_image_url?: string } }; properties?: { nickname?: string; profile_image?: string; thumbnail_image?: string } };
      return { id: String(kakao.id), name: kakao.kakao_account?.profile?.nickname ?? kakao.properties?.nickname ?? "카카오 사용자", image: kakao.kakao_account?.profile?.profile_image_url ?? kakao.kakao_account?.profile?.thumbnail_image_url ?? kakao.properties?.profile_image ?? kakao.properties?.thumbnail_image };
    },
  })] : [])],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "kakao") {
        const matched = await upsertKakaoUser(account.providerAccountId, user?.name, user?.image);
        token.userId = matched.id;
        token.sessionVersion = matched.sessionVersion;
        token.name = matched.displayName;
        token.email = null;
        token.picture = matched.profileImageUrl;
        token.signedInAt = Date.now();
        return token;
      }
      if (user) {
        token.userId = user.id;
        token.sessionVersion = user.sessionVersion;
        token.signedInAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.userId ?? "");
      session.user.sessionVersion = Number(token.sessionVersion ?? -1);
      session.user.name = token.name ?? null;
      session.user.email = token.email ?? "";
      session.user.image = token.picture ?? null;
      session.user.signedInAt = Number(token.signedInAt ?? 0);
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
