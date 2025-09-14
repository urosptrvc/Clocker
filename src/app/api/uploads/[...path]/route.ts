import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filePathParam = url.pathname.replace("/api/uploads/", ""); // uzmi path posle /api/uploads/

  if (!filePathParam) {
    return NextResponse.json({ error: "No file specified" }, { status: 400 });
  }

  const filePath = path.join("/app/uploads", filePathParam);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).substring(1); // jpg, webp, png...

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": `image/${ext === "jpg" ? "jpeg" : ext}`,
      "Cache-Control": "public, max-age=31536000", // možeš prilagoditi
    },
  });
}
