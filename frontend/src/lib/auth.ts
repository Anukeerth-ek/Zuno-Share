import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getBaseUrl } from "@/utils/getBaseUrl";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const BASE_URL = getBaseUrl();
          const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();
          // Adjust based on backend response structure
          const user = data.user || data;
          
          if (user) {
            return {
              id: user.id || user._id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
            };
          }
          return null;
        } catch (error) {
          console.error("AuthOptions authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-only",
};
