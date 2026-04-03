import { NextResponse } from "next/server";
import { google } from "googleapis";
import { unstable_cache } from "next/cache";
import { courseData } from "@/data/course";

const getCachedDriveData = unstable_cache(
  async (code: string) => {
    const rootFolderId = process.env.DRIVE_FOLDER_ID?.trim();
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    
    const drive = google.drive({ version: "v3", auth });

    // Get Details Parent Folder
    const courseSearch = await drive.files.list({
      q: `name contains '${code}' and mimeType = 'application/vnd.google-apps.folder' and '${rootFolderId}' in parents and trashed = false`,
      fields: "files(id, name)",
    });

    const courseFolder = courseSearch.data.files?.[0];

    if (!courseFolder) {
      return null; 
    }

    // Get Subfolders
    const subfolderSearch = await drive.files.list({
      q: `'${courseFolder.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
      orderBy: "name",
    });

    const subfolders = subfolderSearch.data.files || [];

    // Get Files inside subfolders
    const formattedFolders = await Promise.all(
      subfolders.map(async (folder) => {
        const fileSearch = await drive.files.list({
          q: `'${folder.id}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
          fields: "files(id, name, mimeType, webViewLink)",
          orderBy: "name",
        });

        const filesInside = fileSearch.data.files || [];

        return {
          name: folder.name,
          files: filesInside.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.mimeType,
            viewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
          })),
        };
      }),
    );

    return {
      course: courseFolder.name,
      subfolders: formattedFolders,
    };
  },
  ["drive-course-data"],
  {
    revalidate: 86400,
    tags: ["drive-data"],
  }
);

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

    return NextResponse.json({
      success: true,
      course: data.course,
      subfolders: data.subfolders,
    });
    
  } catch (error: any) {
    console.error("Drive API Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Drive data" },
      { status: 500 },
    );
  }
}