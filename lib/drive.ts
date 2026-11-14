import { drive as driveFactory } from "@googleapis/drive";
import { getGoogleAuth, GOOGLE_SCOPES } from "@/lib/google-auth";
import { unstable_cache } from "next/cache";

export type DriveCourseData = {
  course: string | null | undefined;
  subfolders: {
    name: string | null | undefined;
    files: { id: string | null | undefined; name: string | null | undefined; type: string | null | undefined; viewLink: string }[];
  }[];
};

export const getCachedDriveData = unstable_cache(
  async (code: string): Promise<DriveCourseData | null> => {
    const rootFolderId = process.env.DRIVE_FOLDER_ID?.trim();
    const drive = driveFactory({
      version: "v3",
      auth: getGoogleAuth(GOOGLE_SCOPES.driveRead),
    });

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
            viewLink:
              f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
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
  },
);