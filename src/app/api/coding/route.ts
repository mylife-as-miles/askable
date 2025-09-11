import { runPython } from "@/lib/coding";
import { NextRequest, NextResponse } from "next/server";
import { saveNewMessage } from "@/lib/chat-store";
import { generateId } from "ai";

export async function POST(req: NextRequest) {
  try {
    const { code, session_id, files, id } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

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
        runPython(code, session_id, files),
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
      // TODO persist on db that the code execution was aborted?
      return new Response("Request aborted", { status: 200 });
    }

    // Persist the code execution output as an assistant message in the chat history
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
            // args: code, // maybe we don't save code also here cause it's already in the previous llm message
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
  }
}
