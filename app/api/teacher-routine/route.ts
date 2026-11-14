import { DAYS, getRoutineData } from "@/lib/routineSheet";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

interface TeacherSlot {
  time: string;
  batch: string;
  section: string;
  subject: string;
  room: string;
}

interface TeacherRoutineIndexData {
  teachers: string[];
  allTimes: string[];
  routines: Record<string, Record<string, TeacherSlot[]>>;
}

const getCachedTeacherRoutineIndex = unstable_cache(
  async (): Promise<TeacherRoutineIndexData> => {
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

    // Pass 1: Build teacherSet
    data.valueRanges?.forEach((rangeData) => {
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

    const sundaySheet = data.valueRanges?.[0]?.values || [];
    const rawTimelines = sundaySheet[0]?.slice(2) || [];
    const allTimes = rawTimelines.map((time: string) =>
      String(time)
        .replace(/\s*-\s*/g, "-")
        .replace(/\./g, ":"),
    );

    const firstDataRow = sundaySheet[1] || [];
    const breakColIndex = firstDataRow.findIndex(
      (cell) => typeof cell === "string" && cell.toUpperCase().includes("BREAK"),
    );
    const breakIndex = breakColIndex > -1 ? breakColIndex - 2 : -1;

    // Pass 2: Fill routines in one walk
    const tempRoutines: Record<
      string,
      Record<string, Array<TeacherSlot & { timeIndex: number }>>
    > = {};
    const teacherHasClassesMap = new Map<string, boolean>();

    for (const t of teachers) {
      tempRoutines[t] = {};
      teacherHasClassesMap.set(t, false);
      for (const day of DAYS) {
        tempRoutines[t][day] = [];
      }
    }

    data.valueRanges?.forEach((rangeData, index) => {
      const dayName = DAYS[index];
      if (!dayName) return;
      const rows = rangeData.values || [];

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const batch = row[0];
        const section = row[1];

        if (!batch && !section) continue;

        const batchUpper = String(batch || "").toUpperCase();
        if (
          batchUpper.includes("STUDENT NO") ||
          batchUpper.includes("BUS TIME")
        ) {
          continue;
        }

        for (let c = 2; c < row.length; c++) {
          const cellValue = String(row[c] || "").trim();

          if (!cellValue || cellValue.toUpperCase().includes("BREAK")) continue;

          const parts = cellValue
            .replace(/,/g, " ")
            .split(/\s+/)
            .filter(Boolean);

          const timeIndex = c - 2;
          const time = allTimes[timeIndex];
          if (!time) continue;

          const seenTeachers = new Set<string>();
          for (let i = 0; i < parts.length; i++) {
            const partUpper = parts[i].toUpperCase();
            if (teacherSet.has(partUpper) && !seenTeachers.has(partUpper)) {
              seenTeachers.add(partUpper);
              teacherHasClassesMap.set(partUpper, true);
              tempRoutines[partUpper][dayName].push({
                time,
                timeIndex,
                batch: batch || "-",
                section: section || "-",
                subject: parts.slice(0, i).join(" ") || parts[0],
                room: parts.slice(i + 1).join(" ") || "-",
              });
            }
          }
        }
      }
    });

    const routines: Record<string, Record<string, TeacherSlot[]>> = {};

    for (const t of teachers) {
      if (!teacherHasClassesMap.get(t)) {
        routines[t] = {};
        continue;
      }

      routines[t] = {};
      for (const day of DAYS) {
        const daySlots = [...tempRoutines[t][day]];

        if (breakIndex !== -1 && breakIndex < allTimes.length) {
          daySlots.push({
            time: allTimes[breakIndex],
            timeIndex: breakIndex,
            subject: "Break",
            batch: "",
            section: "",
            room: "",
          });
        }

        daySlots.sort((a, b) => a.timeIndex - b.timeIndex);
        routines[t][day] = daySlots.map((slot) => ({
          time: slot.time,
          batch: slot.batch,
          section: slot.section,
          subject: slot.subject,
          room: slot.room,
        }));
      }
    }

    return { teachers, allTimes, routines };
  },
  ["teacher-routine-index"],
  { revalidate: 3600 },
);

export async function GET() {
  try {
    const result = await getCachedTeacherRoutineIndex();

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
