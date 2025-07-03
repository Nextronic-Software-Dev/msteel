import { PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile } from "fs/promises";

const staticDir = join(process.cwd(), "static");

async function POST(request: Request, context: any) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | undefined;
    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const filename = `${Date.now()}.${fileExtension}`;
    await writeFile(join(staticDir, filename), buffer);
    return NextResponse.json({
      message: "File uploaded successfully",
      url: `/static/${filename}`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export { POST };
