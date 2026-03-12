import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

const SHEET_COLUMNS = {
  General: ["Title", "Image URL(Optional)", "Link(Optional)", "Added By"],
  Events: ["Title", "Description", "Type", "Event Date", "Register Deadline", "Image URL(Optional)", "Link", "Location", "Added By"],
  Resources: ["Title", "Format", "Tags", "Link", "Added By"],
};

async function getSheetsClient() {
  const googleAuth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: googleAuth });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tab, formData } = await request.json();
  const columns = SHEET_COLUMNS[tab as keyof typeof SHEET_COLUMNS];
  
  const rowValues = columns.map(col => col === "Added By" ? session?.user?.id : (formData[col] || ""));

  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tab}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [rowValues] },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tab, rowIndex, formData } = await request.json();
  const columns = SHEET_COLUMNS[tab as keyof typeof SHEET_COLUMNS];
  
  const rowValues = columns.map(col => col === "Added By" ? session?.user?.id : (formData[col] || ""));

  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tab}!A${rowIndex}:Z${rowIndex}`, 
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [rowValues] },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  const rowIndex = searchParams.get("rowIndex");

  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tab}!A${rowIndex}:Z${rowIndex}`,
  });

  return NextResponse.json({ success: true });
}