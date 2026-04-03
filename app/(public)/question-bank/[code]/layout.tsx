import { courseData } from "@/data/course";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = await params;
  const courseCode = resolvedParams.code.toUpperCase();
  
  const course = courseData.find((c) => c.course_code === courseCode);
  const courseTitle = course ? ` - ${course.title}` : "";

  return {
    title: `${courseCode}${courseTitle} Resources | LU CSE Campus_OS`,
    description: `Access compiled study materials, archives, and exam patterns for ${courseCode}.`,
  };
}

export default function CourseDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}