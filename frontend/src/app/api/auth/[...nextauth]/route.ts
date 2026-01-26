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
        const BASE_URL = getBaseUrl();
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data?.user) return null;

        // 🧠 Attach the token payload to session
        return {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          avatarUrl: data.user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
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
