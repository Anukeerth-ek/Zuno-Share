import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getBaseUrl } from "@/utils/getBaseUrl";

const handler = NextAuth({
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

          if (!res.ok) {
            console.error("Login request failed with status:", res.status);
            return null;
          }

          const data = await res.json();

          if (!data?.user) {
            console.error("Login successful but no user data returned");
            return null;
          }

          // 🧠 Attach the token payload to session
          return {
            id: data.user.id || data.user._id, // Handle both id and _id
            name: data.user.name,
            email: data.user.email,
            avatarUrl: data.user.avatarUrl,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-only",
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
