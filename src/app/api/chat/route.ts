import { togetherAISDKClient } from "@/lib/clients";
import {
  streamText,
  generateId,
  CoreMessage,
  appendResponseMessages,
  wrapLanguageModel,
  extractReasoningMiddleware,
} from "ai";
import { DbMessage, loadChat, saveNewMessage } from "@/lib/chat-store";
import { limitMessages } from "@/lib/limits";
import { generateCodePrompt } from "@/lib/prompts";
import { CHAT_MODELS } from "@/lib/models";

export async function POST(req: Request) {
  const { id, message, model } = await req.json();

  // get from headers X-Auto-Error-Resolved
  const errorResolved = req.headers.get("X-Auto-Error-Resolved");

  // Use IP address as a simple user fingerprint
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  try {
    if (!errorResolved) {
      await limitMessages(ip);
    }
  } catch (err) {
    return new Response("Too many messages. Daily limit reached.", {
      status: 429,
    });
  }

  const chat = await loadChat(id);

  const newUserMessage: DbMessage = {
    id: generateId(),
    role: "user",
    content: message,
    createdAt: new Date(),
    isAutoErrorResolution: errorResolved === "true",
  };

  // Save the new user message
  await saveNewMessage({ id, message: newUserMessage });

  const messagesToSave: DbMessage[] = [
    ...(chat?.messages || []),
    newUserMessage,
  ];

  const coreMessagesForStream = messagesToSave
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

  // Start timing
  const start = Date.now();

  // Determine which model to use

  const defaultModel = CHAT_MODELS.find((m) => m.isDefault)?.model;

  const selectedModelSlug = typeof model === "string" ? model : undefined;

  const selectedModel =
    (selectedModelSlug &&
      CHAT_MODELS.find((m) => m.slug === selectedModelSlug)?.model) ||
    defaultModel;

  if (!selectedModel) {
    throw new Error("Invalid model selected.");
  }

  try {
    // Create a new model instance based on selectedModel
    const modelInstance = wrapLanguageModel({
      model: togetherAISDKClient(selectedModel),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    });

    // TODO: handling context length here cause coreMessagesForStream could be too long for the currently selected model?

    const stream = streamText({
      model: modelInstance,
      system: generateCodePrompt({
        csvFileUrl: chat?.csvFileUrl || "",
        csvHeaders: chat?.csvHeaders || [],
        csvRows: chat?.csvRows || [],
      }),
      messages: coreMessagesForStream.filter(
        (msg) => msg.role !== "system"
      ) as CoreMessage[],
      onError: (error) => {
        console.error("Error:", error);
      },
      async onFinish({ response }) {
        // End timing
        const end = Date.now();
        const duration = (end - start) / 1000;

        if (response.messages.length > 1) {
          console.log("response.messages", response.messages);
          return;
        }

        const responseMessages = appendResponseMessages({
          messages: messagesToSave,
          responseMessages: response.messages,
        });

        const responseMessage = responseMessages.at(-1);

        if (!responseMessage) {
          return;
        }

        await saveNewMessage({
          id,
          message: {
            ...responseMessage,
            duration,
            model: selectedModel,
          },
        });
      },
    });

    return stream.toDataStreamResponse({
      sendReasoning: true,
    });
  } catch (err) {
    console.error(err);
    return new Response("Error generating response", { status: 500 });
  }
}
