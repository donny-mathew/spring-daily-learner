import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-compatible config — no Prisma, no Node.js-only modules.
// Used by middleware; the full auth.ts spreads this and adds the adapter.
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};
