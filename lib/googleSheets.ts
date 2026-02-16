import { google } from "googleapis";
import { unstable_cache } from "next/cache";

async function fetchSheetsActual() {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    const ranges = [
      "General!A2:G",
      "Events!A2:I",
      "Resources!A2:E",
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      ranges: ranges,
    });

    const valueRanges = response.data.valueRanges || [];

    // Return the clean data structure
    return {
      general: valueRanges[0].values || [],
      events: valueRanges[1].values || [],
      resources: valueRanges[2].values || [],
      lastFetched: Date.now(),
    };
  } catch (error) {
    console.error("Google Sheets Fetch Failed:", error);
    return null;
  }
}

export const getBatchData = unstable_cache(
  async () => fetchSheetsActual(),
  ["google-sheets-full-data"], 
  {
    revalidate: 20, // Check for new data every 20 seconds
    tags: ["sheets"],
  }
);