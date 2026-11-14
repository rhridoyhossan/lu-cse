import { NextResponse } from "next/server";
import { sheets as sheetsFactory } from "@googleapis/sheets";
import { getGoogleAuth, GOOGLE_SCOPES } from "@/lib/google-auth";
import { auth } from "@/auth";
import { revalidateTag } from "next/cache";

const SHEET_COLUMNS = {
  General: ["Title", "Image URL(Optional)", "Link(Optional)", "Added By"],
  Resources: ["Title", "Format", "Tags", "Link", "Added By"],
  Data: ["Key", "Value"],
};

async function getSheetsClient() {
  return sheetsFactory({
    version: "v4",
    auth: getGoogleAuth(GOOGLE_SCOPES.sheetsWrite),
  });
}

function sanitizeSheetValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Neutralize formula triggers (=, +, -, @, tabs, carriage returns)
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tab, formData } = await request.json();
  const columns = SHEET_COLUMNS[tab as keyof typeof SHEET_COLUMNS];
  
  const rowValues = columns.map(col => {
    const rawVal = col === "Added By" ? session?.user?.id : (formData[col] || "");
    return sanitizeSheetValue(rawVal);
  });

  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tab}!A:Z`,
    valueInputOption: "RAW",
    requestBody: { values: [rowValues] },
  });

  revalidateTag("sheets", { expire: 0 });

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tab, rowIndex, formData } = await request.json();
  const columns = SHEET_COLUMNS[tab as keyof typeof SHEET_COLUMNS];
  
  const rowValues = columns.map(col => {
    const rawVal = col === "Added By" ? session?.user?.id : (formData[col] || "");
    return sanitizeSheetValue(rawVal);
  });

  const sheets = await getSheetsClient();

  if (tab !== "Data") {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${tab}!A${rowIndex}:Z${rowIndex}`,
    });
    const existingRow = existing.data.values?.[0] || [];
    const addedByIndex = columns.indexOf("Added By");
    if (addedByIndex !== -1 && existingRow[addedByIndex] && existingRow[addedByIndex] !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only modify your own entries" },
        { status: 403 }
      );
    }
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tab}!A${rowIndex}:Z${rowIndex}`, 
    valueInputOption: "RAW",
    requestBody: { values: [rowValues] },
  });

  revalidateTag("sheets", { expire: 0 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  const rowIndex = searchParams.get("rowIndex");

  const sheets = await getSheetsClient();

  if (tab !== "Data") {
    const columns = SHEET_COLUMNS[tab as keyof typeof SHEET_COLUMNS];
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${tab}!A${rowIndex}:Z${rowIndex}`,
    });
    const existingRow = existing.data.values?.[0] || [];
    const addedByIndex = columns ? columns.indexOf("Added By") : -1;
    if (addedByIndex !== -1 && existingRow[addedByIndex] && existingRow[addedByIndex] !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own entries" },
        { status: 403 }
      );
    }
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tab}!A${rowIndex}:Z${rowIndex}`,
  });

  revalidateTag("sheets", { expire: 0 });

  return NextResponse.json({ success: true });
}