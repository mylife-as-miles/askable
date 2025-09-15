import OpenAI from "openai";
import fs from "fs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RunPythonResult {
  status: "success" | "error";
  outputs: { type: "text"; data: string }[];
  error_message?: string;
}

/**
 * Executes Python code with OpenAI's Responses API & Code Interpreter.
 * Supports file uploads.
 *
 * @param code - Python code to execute
 * @param files - Optional list of local file paths to upload
 */
export async function runPython(
  code: string,
  files?: string[]
): Promise<RunPythonResult> {
  try {
    // Upload files if provided
    let uploadedFiles: string[] = [];
    if (files && files.length > 0) {
      for (const filePath of files) {
        const upload = await client.files.create({
          file: fs.createReadStream(filePath),
          purpose: "assistants", // required purpose for Code Interpreter
        });
        uploadedFiles.push(upload.id);
      }
    }

    // Create the response with Code Interpreter
    const response = await client.responses.create({
      model: "o4-mini", // model with code_interpreter support
      tools: [
        {
          type: "code_interpreter",
          container: { type: "auto" },
        },
      ],
      instructions:
        "You are a Python executor. Run the provided code using uploaded files if needed and return the output only.",
      input: `Run this Python code:\n\n${code}`,
      reasoning: { summary: "auto" },
      attachments:
        uploadedFiles.length > 0
          ? uploadedFiles.map((fileId) => ({ file_id: fileId }))
          : undefined,
    });

    // Extract output
    let outputText = "";
    if (response.output?.[0]?.content) {
      const contentPiece = response.output[0].content.find(
        (c) => c.type === "output_text" || c.type === "text"
      );
      outputText =
        contentPiece && "text" in contentPiece
          ? contentPiece.text
          : JSON.stringify(response.output[0].content);
    }

    return {
      status: "success",
      outputs: [{ type: "text", data: outputText }],
    };
  } catch (err: any) {
    return {
      status: "error",
      outputs: [],
      error_message: err.message,
    };
  }
}
