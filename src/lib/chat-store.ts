"use server";
import { Message as AIMsg, generateText } from "ai";
import { generateId } from "ai";
import { openRouterClient, runQuery } from "./clients";
import { generateTitlePrompt } from "./prompts";
import type { RowDataPacket } from 'mysql2';

// Extend the Message type to include duration for database persistence
export type DbMessage = AIMsg & {
  duration?: number;
  model?: string; // which model was used to generate this message
  isAutoErrorResolution?: boolean; // if true then this message is an automatic error resolution prompt
};

type ChatData = {
  messages: DbMessage[];
  csvFileUrl: string | null;
  csvHeaders: string[] | null;
  csvRows: { [key: string]: string }[] | null;
  title: string | null; // inferring the title of the chat based on csvHeaders and first user messages
  createdAt?: Date;
  // ...future fields
};

export async function createChat({
  userQuestion,
  csvHeaders,
  csvRows,
  csvFileUrl,
}: {
  userQuestion: string;
  csvHeaders: string[];
  csvRows: { [key: string]: string }[];
  csvFileUrl: string;
}): Promise<string> {
  const id = generateId();

  // use userQuestion to generate a title for the chat
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Please configure it in your environment to create chats."
    );
  }
  const { text: title } = await generateText({
    model: openRouterClient.languageModel("meta-llama/Llama-3.3-70B-Instruct-Turbo"),
    prompt: generateTitlePrompt({ csvHeaders, userQuestion }),
    maxTokens: 100,
  });

  const initial: ChatData = {
    messages: [],
    csvHeaders,
    csvRows,
    csvFileUrl,
    title,
    createdAt: new Date(),
  };
  await runQuery("INSERT INTO chats (id, data) VALUES (?, ?)", [
    id,
    JSON.stringify(initial),
  ]);
  return id;
}

export async function loadChat(id: string): Promise<ChatData | null> {
  const [rows] = await runQuery<RowDataPacket[]>("SELECT data FROM chats WHERE id = ?", [id]);
  if (rows.length === 0) return null;
  const row = rows[0] as { data: string };
  return JSON.parse(row.data) as ChatData;
}

export async function saveNewMessage({
  id,
  message,
}: {
  id: string;
  message: DbMessage;
}): Promise<void> {
  const chat = await loadChat(id);
  if (chat) {
    const updatedMessages = [...(chat.messages || []), message];
    await runQuery("UPDATE chats SET data = ? WHERE id = ?", [
      JSON.stringify({
        ...chat,
        messages: updatedMessages,
      }),
      id,
    ]);
  } else {
    // If chat does not exist, create a new one with this message
    const newChat: ChatData = {
      messages: [message],
      csvHeaders: null,
      csvRows: null,
      csvFileUrl: null,
      title: null,
    };
    await runQuery("INSERT INTO chats (id, data) VALUES (?, ?)", [
      id,
      JSON.stringify(newChat),
    ]);
  }
}
