import { sheets as sheetsFactory } from "@googleapis/sheets";
import { getGoogleAuth, GOOGLE_SCOPES } from "@/lib/google-auth";

export async function fetchSheets() {
  try {
    const sheets = sheetsFactory({
      version: "v4",
      auth: getGoogleAuth(GOOGLE_SCOPES.sheetsRead),
    });

    const ranges = ["General!A1:G", "Events!A1:I", "Resources!A1:E"];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      ranges: ranges,
    });

    const valueRanges = response.data.valueRanges || [];

    const formatSheet = (sheetData: any[]) => {
      if (!sheetData || sheetData.length < 2) return [];
      const headers = sheetData[0];

      return sheetData.slice(1).map((row, index) => {
        const rowObj: any = { _rowIndex: index + 2 };
        headers.forEach((header: string, i: number) => {
          rowObj[header] = row[i] || "";
        });
        return rowObj;
      });
    };

    return {
      General: formatSheet(valueRanges[0]?.values || []),
      Events: formatSheet(valueRanges[1]?.values || []),
      Resources: formatSheet(valueRanges[2]?.values || []),
    };
  } catch (error) {
    console.error("Google Sheets Fetch Failed:", error);
    return { General: [], Events: [], Resources: [] };
  }
}
