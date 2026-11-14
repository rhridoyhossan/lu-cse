import { courseData } from "@/data/course";
import { notFound } from "next/navigation";
import CourseDetailsClient from "@/components/CourseDetailsClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  const theoryCourses = courseData.filter(
    (c) => !c.title.toLowerCase().includes("sessional"),
  );
  const codes = new Set<string>();
  for (const c of theoryCourses) {
    codes.add(c.course_code.toLowerCase());
    codes.add(c.course_code.toUpperCase());
  }
  return Array.from(codes).map((code) => ({ code }));
}

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = await params;
  const courseCode = resolvedParams.code.toUpperCase();

  const course = courseData.find((c) => c.course_code === courseCode);
  if (!course || course.title.toLowerCase().includes("sessional")) {
    notFound();
  }

  return <CourseDetailsClient courseCode={courseCode} course={course} />;
}
