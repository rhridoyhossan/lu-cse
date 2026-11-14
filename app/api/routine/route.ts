import { NextResponse } from "next/server";
import { DAYS, getRoutineData } from "@/lib/routineSheet";
import { unstable_cache } from "next/cache";

interface BatchData {
  batch: string;
  sections: string[];
}

interface RoutineSlot {
  time: string;
  subject: string;
}

type WeeklyRoutine = Record<string, RoutineSlot[]>;

interface RoutineIndexData {
  classes: BatchData[];
  timelines: string[];
  routines: Record<string, WeeklyRoutine>;
}

const getCachedRoutineIndex = unstable_cache(
  async (): Promise<RoutineIndexData> => {
    const data = await getRoutineData();

    const sundaySheet = data.valueRanges?.[0]?.values;
    if (!sundaySheet || sundaySheet.length < 2) {
      throw new Error("Sheet data is empty");
    }

    const batchMap = new Map<string, { batch: string; sections: string[] }>();

    for (let i = 1; i < sundaySheet.length; i++) {
      const row = sundaySheet[i];
      const batch = row[0];
      const section = row[1];

      if (batch && section) {
        if (!batchMap.has(batch)) {
          batchMap.set(batch, { batch, sections: [] });
        }

        batchMap.get(batch)!.sections.push(section);
      }
    }

    const classes = Array.from(batchMap.values());

    const rawTimelines = sundaySheet[0].slice(2);
    const timelines = rawTimelines.map((time: string) =>
      String(time)
        .replace(/\s*-\s*/g, "-")
        .replace(/\./g, ":"),
    );

    const firstDataRow = sundaySheet[1] || [];
    const breakColIndex = firstDataRow.findIndex(
      (cell) => typeof cell === "string" && cell.toUpperCase().includes("BREAK"),
    );

    const breakIndex = breakColIndex > -1 ? breakColIndex - 2 : -1;

    const dayMaps: Array<{ dayName: string; rowMap: Map<string, string[]> }> = [];

    data.valueRanges?.forEach((rangeData, index) => {
      const dayName = DAYS[index];
      if (!dayName) return;

      const rows = rangeData.values || [];
      const rowMap = new Map<string, string[]>();

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const b = String(row[0] || "").trim();
        const s = String(row[1] || "").trim();
        if (b && s) {
          rowMap.set(`${b}|${s}`, row);
        }
      }

      dayMaps.push({ dayName, rowMap });
    });

    const routines: Record<string, WeeklyRoutine> = {};

    for (const cls of classes) {
      for (const section of cls.sections) {
        const key = `${cls.batch}|${section}`;
        const weeklyRoutine: WeeklyRoutine = {};

        for (const { dayName, rowMap } of dayMaps) {
          const targetRow = rowMap.get(key);

          weeklyRoutine[dayName] = timelines.map((time: string, i: number) => {
            if (i === breakIndex) {
              return { time, subject: "Break" };
            }

            const subject = targetRow ? targetRow[i + 2] : null;

            return {
              time,
              subject: subject && subject.trim() !== "" ? subject.trim() : "-",
            };
          });
        }

        routines[key] = weeklyRoutine;
      }
    }

    return { classes, timelines, routines };
  },
  ["routine-index"],
  { revalidate: 3600 },
);

export async function GET() {
  try {
    const result = await getCachedRoutineIndex();

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
