import { JWT } from "google-auth-library";

export const GOOGLE_SCOPES = {
  sheetsRead: "https://www.googleapis.com/auth/spreadsheets.readonly",
  sheetsWrite: "https://www.googleapis.com/auth/spreadsheets",
  driveRead: "https://www.googleapis.com/auth/drive.readonly",
} as const;

type GoogleScope = (typeof GOOGLE_SCOPES)[keyof typeof GOOGLE_SCOPES];

// One client per scope, reused across requests in the same instance.
const clients = new Map<GoogleScope, JWT>();

export function getGoogleAuth(scope: GoogleScope): JWT {
  let client = clients.get(scope);

  if (!client) {
    client = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: [scope],
    });
    clients.set(scope, client);
  }

  return client;
}
