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

    const ranges = ["General!A2:G", "Events!A2:I", "Resources!A2:E"];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      ranges: ranges,
    });

    const valueRanges = response.data.valueRanges || [];
    const cleanData = (data: any) => {
      if (!data) return [];

      return data.filter((row: any) => {
        if (!row || row.length === 0) return false;
        const hasRealData = row.some(
          (cell: any) => cell && String(cell).trim() !== "",
        );

        return hasRealData;
      });
    };

    // Return the clean data structure
    return {
      general: cleanData(valueRanges[0].values),
      events: cleanData(valueRanges[1].values),
      resources: cleanData(valueRanges[2].values),
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
    revalidate: 60 * 5,
    tags: ["sheets"],
  },
);
