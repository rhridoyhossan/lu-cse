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

// GET Request: list of all unique teacher acronyms
export async function GET() {
  try {
    const data = await getRoutineData();
    const teacherSet = new Set<string>();
    const excludeList = [
      "RAB",
      "RKB",
      "ACL",
      "LAB",
      "PHY",
      "CHE",
      "MAT",
      "GED",
      "CSE",
      "NL",
    ];

    data.valueRanges.forEach((rangeData: any) => {
      const rows = rangeData.values || [];

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        for (let c = 2; c < row.length; c++) {
          const cellValue = String(row[c] || "").trim();

          if (cellValue && !cellValue.toUpperCase().includes("BREAK")) {
            const parts = cellValue
              .replace(/,/g, " ")
              .split(/\s+/)
              .filter(Boolean);

            if (parts.length >= 2) {
              const possibleTeacher = parts[1].toUpperCase();

              if (
                /^[A-Z]{2,5}$/.test(possibleTeacher) &&
                !excludeList.includes(possibleTeacher)
              ) {
                teacherSet.add(possibleTeacher);
              }
            }
          }
        }
      }
    });

    const teachers = Array.from(teacherSet).sort();
    return NextResponse.json({ teachers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST Request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetTeacher = String(body.teacher).trim().toUpperCase();

    if (!targetTeacher) {
      return NextResponse.json(
        { error: "Teacher acronym is required" },
        { status: 400 },
      );
    }

    const data = await getRoutineData();
    const sundaySheet = data.valueRanges[0].values;

    const rawTimelines = sundaySheet[0].slice(2);
    const cleanTimelines = rawTimelines.map((time: string) => {
      return String(time)
        .replace(/\s*-\s*/g, "-")
        .replace(/\./g, ":");
    });

    const firstDataRow = sundaySheet[1] || [];
    const breakColIndex = firstDataRow.findIndex(
      (cell: any) =>
        typeof cell === "string" && cell.toUpperCase().includes("BREAK"),
    );
    const breakIndex = breakColIndex > -1 ? breakColIndex - 2 : -1;

    const weeklyRoutine: Record<string, any[]> = {};
    let teacherHasClasses = false;

    // Schedule Build
    data.valueRanges.forEach((rangeData: any, index: number) => {
      const dayName = DAYS[index];
      const rows = rangeData.values || [];
      weeklyRoutine[dayName] = [];

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const batch = row[0];
        const section = row[1];

        if (!batch && !section) continue;
        if (
          batch.toUpperCase().includes("STUDENT NO") ||
          batch.toUpperCase().includes("BUS TIME")
        )
          continue;

        for (let c = 2; c < row.length; c++) {
          const cellValue = String(row[c] || "").trim();

          if (cellValue && !cellValue.toUpperCase().includes("BREAK")) {
            const parts = cellValue
              .replace(/,/g, " ")
              .split(/\s+/)
              .filter(Boolean);
            const teacherIndex = parts.findIndex(
              (part) => part.toUpperCase() === targetTeacher,
            );

            if (teacherIndex !== -1) {
              teacherHasClasses = true;
              weeklyRoutine[dayName].push({
                time: cleanTimelines[c - 2],
                timeIndex: c - 2,
                batch: batch || "-",
                section: section || "-",
                subject: parts.slice(0, teacherIndex).join(" ") || parts[0],
                room: parts.slice(teacherIndex + 1).join(" ") || "-",
              });
            }
          }
        }
      }

      if (breakIndex !== -1) {
        weeklyRoutine[dayName].push({
          time: cleanTimelines[breakIndex],
          timeIndex: breakIndex,
          subject: "Break",
          batch: "",
          section: "",
          room: "",
        });
      }

      // Sort chronological
      weeklyRoutine[dayName].sort((a, b) => a.timeIndex - b.timeIndex);
      weeklyRoutine[dayName] = weeklyRoutine[dayName].map(
        ({ timeIndex, ...rest }) => rest,
      );
    });

    if (!teacherHasClasses) {
      return NextResponse.json({
        teacher: targetTeacher,
        routine: {},
        allTimes: cleanTimelines,
      });
    }

    return NextResponse.json({
      teacher: targetTeacher,
      routine: weeklyRoutine,
      allTimes: cleanTimelines,
      // data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
