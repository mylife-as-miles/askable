import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // needed for browser use
});

export interface RunPythonResult {
  status: "success" | "error";
  outputs: { type: "text"; data: string }[];
  error_message?: string;
}

/**
 * Executes Python code with OpenAI's Responses API & Code Interpreter.
 * Supports uploading files from IndexedDB or <input type="file">.
 *
 * @param code - Python code to execute
 * @param files - Optional list of File/Blob objects
 */
export async function runPython(
  code: string,
  files?: (File | Blob)[]
): Promise<RunPythonResult> {
  try {
    // Upload files if provided
    let uploadedFiles: { file_id: string }[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const upload = await client.files.create({
          file, // Directly pass the File/Blob object
          purpose: "assistants", // Required purpose
        });
        uploadedFiles.push({ file_id: upload.id });
      }
    }

    // Build input for the API
    const inputItems: any[] = [
      {
        role: "user",
        content: [{ type: "input_text", text: `Run this Python code:\n\n${code}` }],
      },
      ...uploadedFiles.map((f) => ({
        role: "user",
        content: [{ type: "file_reference", file_id: f.file_id }],
      })),
    ];

    // Execute Python code with Code Interpreter
    const response = await client.responses.create({
      model: "o4-mini",
      tools: [{ type: "code_interpreter", container: { type: "auto" } }],
      input: inputItems,
    });

    // Extract output text
    const outputText = response.output_text || JSON.stringify(response.output);

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
