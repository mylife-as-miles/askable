import OpenAI from "openai";
import { NextResponse } from "next/server";
import { toFile } from "openai/uploads";

export const runtime = "nodejs"; // ensure Node runtime for file uploads

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code: string | undefined = body?.code;
    const files: Array<{ name: string; content: string; type?: string }> = body?.files || [];

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing 'code' in request body" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    // Upload files if provided
    const uploaded: { file_id: string }[] = [];
    for (const f of files) {
      try {
        const fileObj = await toFile(Buffer.from(f.content, "utf-8"), f.name, {
          type: f.type || "text/plain",
        });
        const uploadedFile = await client.files.create({
          file: fileObj,
          purpose: "assistants",
        });
        uploaded.push({ file_id: uploadedFile.id });
      } catch (e) {
        return NextResponse.json(
          { error: `Failed to upload file ${f.name}: ${(e as Error)?.message || e}` },
          { status: 500 }
        );
      }
    }

    const inputItems: any[] = [
      {
        role: "user",
        content: [{ type: "input_text", text: `Run this Python code:\n\n${code}` }],
      },
      ...uploaded.map((u) => ({ role: "user", content: [{ type: "file_reference", file_id: u.file_id }] })),
    ];

    const response = await client.responses.create({
      model: "o4-mini",
      tools: [{ type: "code_interpreter", container: { type: "auto" } }],
      input: inputItems,
    });

    const outputText = (response as any).output_text || JSON.stringify((response as any).output);

    return NextResponse.json({ status: "success", outputs: [{ type: "text", data: outputText }] });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", outputs: [], error_message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
