import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { google } from "googleapis";

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
          const googleAuth = new google.auth.GoogleAuth({
            credentials: {
              client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
              private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
          });

          const sheets = google.sheets({ version: "v4", auth: googleAuth });

          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "Users!A2:E",
          });

          const rows = response.data.values;
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
