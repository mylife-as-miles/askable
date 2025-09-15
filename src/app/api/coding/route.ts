import { runPython } from "@/lib/coding";
import { NextRequest, NextResponse } from "next/server";
import { saveNewMessage, loadChat } from "@/lib/chat-store";
import { generateId } from "ai";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  try {
    const { code, id } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    if (!id) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    // Load chat data to get CSV info
    const chat = await loadChat(id);
    if (!chat || !chat.csvHeaders || !chat.csvRows) {
      return NextResponse.json({ error: "CSV data not found for this chat" }, { status: 404 });
    }

    // Reconstruct CSV and write to a temporary file
    const headers = chat.csvHeaders; // Assign to a new const to help TS with type narrowing
    const header = headers.join(",") + "\n";
    const body = chat.csvRows
      .map((row) => headers.map((h) => row[h] ?? "").join(","))
      .join("\n");
    const csvString = header + body;

    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `chat-${id}-${Date.now()}.csv`);
    await fs.writeFile(tempFilePath, csvString);

    // Prepend code to load the CSV into a pandas DataFrame
    const codePrefix = `import pandas as pd\ndf = pd.read_csv('${tempFilePath}')\n\n`;
    const fullCode = codePrefix + code;

    // Start timing
    const start = Date.now();

    // Timeout logic: 60 seconds
    const TIMEOUT_MS = 60000;
    let timeoutHandle: NodeJS.Timeout | undefined = undefined;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error("Code execution timed out after 60 seconds."));
      }, TIMEOUT_MS);
    });

    let result;
    try {
      result = await Promise.race([
        runPython(fullCode, [tempFilePath]),
        timeoutPromise,
      ]);
    } catch (err: any) {
      if (err.message && err.message.includes("timed out")) {
        return NextResponse.json({ error: err.message }, { status: 504 });
      }
      throw err;
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }

    const end = Date.now();
    const duration = (end - start) / 1000;

    if (req.signal.aborted) {
      console.log("Request aborted already from the client");
      return new Response("Request aborted", { status: 200 });
    }

    // Persist the code execution output
    if (id && !req.signal.aborted) {
      const toolCallMessage = {
        id: generateId(),
        role: "assistant" as const,
        content: "Code execution complete.",
        createdAt: new Date(),
        duration,
        toolCall: {
          toolInvocation: {
            toolName: "runCode",
            state: "result",
            result: result,
          },
        },
      };
      await saveNewMessage({ id, message: toolCallMessage });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Clean up the temporary file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Failed to clean up temporary file:", cleanupError);
      }
    }
  }
}
