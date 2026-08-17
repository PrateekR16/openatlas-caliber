import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// ponytail: dev-only quick login so the authed flow is testable without Google
// Cloud setup. Gated to development — never available in production.
const devProviders =
  process.env.NODE_ENV === "development"
    ? [
        Credentials({
          id: "dev",
          name: "Demo user",
          credentials: {},
          authorize: async () => ({
            id: "demo",
            name: "Demo Applicant",
            email: "demo@caliber.app",
          }),
        }),
      ]
    : [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, ...devProviders],
  pages: { signIn: "/signin" },
});
