import { sheets as sheetsFactory } from "@googleapis/sheets";
import { getGoogleAuth, GOOGLE_SCOPES } from "@/lib/google-auth";
import { unstable_cache } from "next/cache";

export interface PageNotification {
  slug: string;
  html: string;
}

async function fetchSheetsActual() {
  try {
    const sheets = sheetsFactory({
      version: "v4",
      auth: getGoogleAuth(GOOGLE_SCOPES.sheetsRead),
    });

    const ranges = [
      "General!A2:G",
      "Events!A2:I",
      "Resources!A2:E",
      "Data!A1:B",
    ];

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

    const rawData = cleanData(valueRanges[3]?.values);
    const notifications: PageNotification[] = rawData
      .slice(2, 4)
      .map((row: any[]) => ({
        slug: String(row[0] || "").trim(),
        html: String(row[1] || "").trim(),
      }))
      .filter((item: PageNotification) => Boolean(item.slug && item.html));

    return {
      general: cleanData(valueRanges[0]?.values),
      events: cleanData(valueRanges[1]?.values),
      resources: cleanData(valueRanges[2]?.values),
      data: rawData,
      notifications,
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
    revalidate: 60 * 10,
    tags: ["sheets"],
  },
);
