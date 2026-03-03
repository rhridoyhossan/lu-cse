import { NextResponse } from "next/server";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function getRoutineData() {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.STUDENT_ROUTINE_SHEET_ID;

  const ranges = DAYS.map((day) => `ranges=${day}!B2:J`).join("&");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?${ranges}&key=${apiKey}`;

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error("Failed to fetch data from Google Sheets");
  }

  return response.json();
}

// GET Request: Returns all available Batches and Sections
export async function GET() {
  try {
    const data = await getRoutineData();

    const sundaySheet = data.valueRanges?.[0]?.values;
    if (!sundaySheet || sundaySheet.length < 2) {
      return NextResponse.json(
        { error: "Sheet data is empty" },
        { status: 500 },
      );
    }

    const batchMap = new Map();

    for (let i = 1; i < sundaySheet.length; i++) {
      const row = sundaySheet[i];
      const batch = row[0];
      const section = row[1];

      if (batch && section) {
        if (!batchMap.has(batch)) {
          batchMap.set(batch, { batch: batch, sections: [] });
        }

        batchMap.get(batch).sections.push(section);
      }
    }

    // Convert the Map values back into a standard array
    const availableClasses = Array.from(batchMap.values());

    return NextResponse.json({ classes: availableClasses });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST Request: Returns the specific week routine for a given batch and section
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetBatch = String(body.batch).trim();
    const targetSection = String(body.section).trim();

    if (!targetBatch || !targetSection) {
      return NextResponse.json({ error: "Batch and section are required" }, { status: 400 });
    }

    const data = await getRoutineData();
    const sundaySheet = data.valueRanges[0].values;
    
    // 1. Extract and clean the timeline headers
    const rawTimelines = sundaySheet[0].slice(2); 
    const cleanTimelines = rawTimelines.map((time: string) => {
      return String(time)
        .replace(/\s*-\s*/g, '-') 
        .replace(/\./g, ':');     
    });

    // 2. Break Detection
    const firstDataRow = sundaySheet[1] || [];
    const breakColIndex = firstDataRow.findIndex(
      (cell: any) => typeof cell === 'string' && cell.toUpperCase().includes('BREAK')
    );
    
    const breakIndex = breakColIndex > -1 ? breakColIndex - 2 : -1;

    const weeklyRoutine: Record<string, any[]> = {};

    // 3. Build the schedule
    data.valueRanges.forEach((rangeData: any, index: number) => {
      const dayName = DAYS[index];
      const rows = rangeData.values;

      const targetRow = rows?.find((row: any[]) => 
        String(row[0]).trim() === targetBatch && 
        String(row[1]).trim() === targetSection
      );

      weeklyRoutine[dayName] = cleanTimelines.map((time: string, i: number) => {
        if (i === breakIndex) {
          return { time, subject: "Break" };
        }

        const subject = targetRow ? targetRow[i + 2] : null;

        return {
          time,
          subject: subject && subject.trim() !== "" ? subject.trim() : "-"
        };
      });
    });

    return NextResponse.json({ 
      batch: targetBatch, 
      section: targetSection, 
      timelines: cleanTimelines,  
      routine: weeklyRoutine 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
