import fs from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import sharp from "sharp";

function formatDateForFolder(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export async function saveImage(
  file: File,
  userId: string,
  clocktype: string,
): Promise<string> {
  if (!file || typeof file === "string") return "";

  const buffer = Buffer.from(await file.arrayBuffer());
  const today = new Date();
  const formattedDate = formatDateForFolder(today);
  const filename = `${uuid()}.webp`;

  const uploadDir = path.join("/app/uploads", userId, formattedDate, clocktype);

  if (!fs.existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);

  await sharp(buffer)
    .resize({ width: 1280 })
    .webp({ quality: 70 })
    .toFile(filepath);

  return `/api/uploads/${userId}/${formattedDate}/${clocktype}/${filename}`;
}
