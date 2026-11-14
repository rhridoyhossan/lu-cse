import { getBatchData } from "@/lib/googleSheets";

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface SheetRangeValue {
  range?: string;
  values?: string[][];
}

export interface RoutineSheetResponse {
  spreadsheetId?: string;
  valueRanges?: SheetRangeValue[];
}

export async function getRoutineData(): Promise<RoutineSheetResponse> {
  const db = await getBatchData();

  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = db?.data?.[0]?.[1];

  if (!sheetId) {
    throw new Error("Student routine sheet ID is missing");
  }

  const ranges = DAYS.map((day) => `ranges=${day}!B2:K`).join("&");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?${ranges}&key=${apiKey}`;

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error("Failed to fetch data from Google Sheets");
  }

  return response.json();
}