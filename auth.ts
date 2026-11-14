import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sheets as sheetsFactory } from "@googleapis/sheets";
import { getGoogleAuth, GOOGLE_SCOPES } from "@/lib/google-auth";
import { unstable_cache } from "next/cache";

const getCachedUsers = unstable_cache(
  async () => {
    try {
      const sheets = sheetsFactory({
        version: "v4",
        auth: getGoogleAuth(GOOGLE_SCOPES.sheetsRead),
      });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Users!A2:E",
      });

      return response.data.values;
    } catch (error) {
      console.error("Google Sheets Fetch Error:", error);
      return null;
    }
  },
  ["google-sheets-users-auth"],
  { revalidate: 300 },
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const rows = await getCachedUsers();

          if (!rows || rows.length === 0) return null;

          const userRow = rows.find((row) => row[0] === credentials.username);

          if (userRow && userRow[1] === credentials.password) {
            return { id: userRow[0], name: userRow[2] };
          }

          return null;
        } catch (error) {
          console.error("Google Sheets Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
