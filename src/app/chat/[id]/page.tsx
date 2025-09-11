import { loadChat } from "@/lib/chat-store";
import { ChatScreen } from "@/components/chat-screen";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const chat = await loadChat(id);
  if (!chat) {
    return {
      title: `Chat not found | ${APP_NAME}`,
      description: "No chat found for this ID.",
    };
  }
  return {
    title:
      `${chat.title} | ${APP_NAME}` ||
      `Chat "${
        chat.messages.find((msg) => msg.role === "user")?.content
      }" | ${APP_NAME}`,
    description: chat.csvHeaders
      ? `Chat about CSV columns: ${chat.csvHeaders.join(", ")}`
      : "Chat with your CSV using Together.ai",
    openGraph: {
  images: ["https://askable.com/og.jpg"],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const chat = await loadChat(id);

  return (
    <ChatScreen
      id={id}
      initialMessages={chat?.messages}
      uploadedFile={{
        url: chat?.csvFileUrl || "",
        csvHeaders: chat?.csvHeaders || [],
        csvRows: chat?.csvRows || [],
      }}
    />
  );
}
