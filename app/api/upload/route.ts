import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type });

    const imgbbForm = new FormData();
    
    const apiKey = process.env.IMGBB_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing Imgbb API key" }, { status: 500 });
    }
    imgbbForm.append("key", apiKey);
    
    imgbbForm.append("image", blob, file.name);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbForm,
    });

    const data = await response.json();
    
    if (data.status === 200 && data.data?.url) {
      return NextResponse.json({ success: true, url: data.data.url });
    } else {
      console.error(">>> IMGBB API ERROR:", data);
      return NextResponse.json({ 
        error: data.error?.message || "Imgbb rejected the upload" 
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error(">>> INTERNAL SERVER ERROR:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}