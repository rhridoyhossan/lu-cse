import { NextResponse } from "next/server";
import { sheets as sheetsFactory } from "@googleapis/sheets";
import { getGoogleAuth, GOOGLE_SCOPES } from "@/lib/google-auth";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { courseData } from "@/data/course";

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

function revalidateForTab(tab: string | null) {
  revalidateTag("sheets", { expire: 0 });

  if (tab === "General") {
    revalidatePath("/");
    revalidatePath("/notices");
  } else if (tab === "Resources") {
    revalidatePath("/resources");
  } else if (tab === "Data") {
    revalidateTag("routine-data", { expire: 0 });
    revalidatePath("/", "layout");
    revalidatePath("/api/routine");
    revalidatePath("/api/teacher-routine");
  } else {
    revalidatePath("/", "layout");
  }
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
  if (!columns) {
    return NextResponse.json({ error: "Invalid sheet tab" }, { status: 400 });
  }
  
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

  revalidateForTab(tab);

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tab, rowIndex, formData } = await request.json();
  const columns = SHEET_COLUMNS[tab as keyof typeof SHEET_COLUMNS];
  if (!columns) {
    return NextResponse.json({ error: "Invalid sheet tab" }, { status: 400 });
  }
  
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

  revalidateForTab(tab);

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

  revalidateForTab(tab);

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { target, courseCode } = await request.json();

  if (target === "routine") {
    revalidateTag("routine-data", { expire: 0 });
    revalidatePath("/api/routine");
    revalidatePath("/api/teacher-routine");

    return NextResponse.json({
      success: true,
      message: "Routine cache revalidated",
    });
  }

  if (target === "drive") {
    const code = typeof courseCode === "string" ? courseCode.trim().toUpperCase() : "";
    const validCourse = courseData.find(
      (c) => c.course_code === code && !c.title.toLowerCase().includes("sessional"),
    );

    if (!validCourse) {
      return NextResponse.json(
        { error: "Invalid theory course code" },
        { status: 400 },
      );
    }

    revalidateTag(`drive-data-${code}`, { expire: 0 });
    revalidatePath(`/question-bank/${code.toLowerCase()}`);
    revalidatePath(`/question-bank/${code.toUpperCase()}`);
    revalidatePath("/api/course");

    return NextResponse.json({
      success: true,
      message: `Drive cache revalidated for ${code}`,
    });
  }

  return NextResponse.json(
    { error: "Invalid revalidation target" },
    { status: 400 },
  );
}