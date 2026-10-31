import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "user" | "admin";
    sessionVersion?: number;
  }
  interface Session {
    user: {
      id: string;
      sessionVersion: number;
      signedInAt: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    sessionVersion?: number;
    signedInAt?: number;
  }
}
