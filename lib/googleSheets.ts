import { google } from "googleapis";
import { unstable_cache } from "next/cache";
interface SheetData {
  general: any[];
  events: any[];
  sections: Record<string, any[]>;
  resources: any[];
  lastFetched: number; // To track when we last got data
}
const globalForSheets = global as unknown as { sheetCache: SheetData | null };
async function fetchSheetsActual() {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g, "\n");
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
      "Sec-A!A2:F",
      "Sec-B!A2:F",
      "Sec-C!A2:F",
      "Sec-D!A2:F",
      "Sec-E!A2:F",
      "Sec-F!A2:F",
      "Resources!A2:E",
    ];
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      ranges: ranges,
    });
    const valueRanges = response.data.valueRanges || [];
    const data = {
      general: valueRanges[0].values || [],
      events: valueRanges[1].values || [],
      sections: {
        "Sec-A": valueRanges[2].values || [],
        "Sec-B": valueRanges[3].values || [],
        "Sec-C": valueRanges[4].values || [],
        "Sec-D": valueRanges[5].values || [],
        "Sec-E": valueRanges[6].values || [],
        "Sec-F": valueRanges[7].values || [],
      },
      resources: valueRanges[8].values || [],
      lastFetched: Date.now(),
    }; // Save to global cache
    globalForSheets.sheetCache = data;
    return data;
  } catch (error) {
    console.error("Batch fetch failed:", error);
    return null;
  }
}
export const getBatchData = async () => {
  if (globalForSheets.sheetCache) {
    const age = (Date.now() - globalForSheets.sheetCache.lastFetched) / 1000;
    if (age < 20) return globalForSheets.sheetCache; // Serving from In-Memory Cache (No API Call)
  }
  return await unstable_cache(fetchSheetsActual, ["google-sheets-full-data"], {
    revalidate: 20,
    tags: ["sheets"],
  })();
};
