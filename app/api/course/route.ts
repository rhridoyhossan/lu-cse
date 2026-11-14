import { NextResponse } from "next/server";
import { courseData } from "@/data/course";
import { getCachedDriveData } from "@/lib/drive";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.toUpperCase();

  if (!code || !courseData.find((c) => c.course_code == code)) {
    return NextResponse.json(
      { success: false, error: "Invalid or missing course code" },
      { status: 400 },
    );
  }

  try {
    const data = await getCachedDriveData(code);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Course folder not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        course: data.course,
        subfolders: data.subfolders,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Drive API Error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Drive data" },
      { status: 500 },
    );
  }
}
