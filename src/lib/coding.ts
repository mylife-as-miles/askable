import OpenAI from "openai";
import fs from "fs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RunPythonResult {
  status: "success" | "error";
  outputs: { type: "text" | "image"; data: string }[];
  error_message?: string;
}

/**
 * Executes Python code using OpenAI's Assistants API with Code Interpreter.
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
    // 1. Upload files if provided and get file IDs
    let file_ids: string[] = [];
    if (files && files.length > 0) {
      for (const filePath of files) {
        const file = await client.files.create({
          file: fs.createReadStream(filePath),
          purpose: "assistants",
        });
        file_ids.push(file.id);
      }
    }

    // 2. Create an Assistant
    const assistant = await client.beta.assistants.create({
      name: "Data Analyst Assistant",
      instructions: "You are a Python data analyst. Run the provided code and generate visualizations if requested.",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4-turbo",
    });

    // 3. Create a Thread
    const thread = await client.beta.threads.create();

    // 4. Add a Message to the Thread
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: code,
      attachments: file_ids.map(id => ({ file_id: id, tools: [{type: "code_interpreter"}] })),
    });

    // 5. Create a Run
    let run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // 6. Poll for completion
    while (["queued", "in_progress", "cancelling"].includes(run.status)) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s
      run = await client.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (run.status === "completed") {
      const messages = await client.beta.threads.messages.list(thread.id);
      const outputs: { type: "text" | "image"; data: string }[] = [];

      // Find the last assistant message
      const lastAssistantMessage = messages.data.find(m => m.role === 'assistant');

      if (lastAssistantMessage) {
        for (const content of lastAssistantMessage.content) {
          if (content.type === "text") {
            outputs.push({ type: "text", data: content.text.value });
          } else if (content.type === "image_file") {
            // To return an image, we'd need to fetch the file content from the ID.
            // For simplicity here, we'll just return the file_id as a string.
            // A real implementation would fetch the image data and return it as base64.
            outputs.push({ type: "image", data: `Image file ID: ${content.image_file.file_id}` });
          }
        }
      }

      return {
        status: "success",
        outputs: outputs,
      };
    } else {
      return {
        status: "error",
        outputs: [],
        error_message: `Run failed with status: ${run.status}. Last error: ${run.last_error?.message}`,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      outputs: [],
      error_message: err.message,
    };
  }
}
