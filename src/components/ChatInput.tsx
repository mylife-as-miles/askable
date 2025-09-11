"use client";

import type React from "react";
import { useUserLimits } from "@/hooks/UserLimitsContext";
import { PromptInput } from "./PromptInput";
import { UploadedFile } from "@/lib/utils";

export function ChatInput({
  isLLMAnswering,
  value,
  onChange,
  onSend,
  uploadedFile,
  onStopLLM,
  placeholder = "Ask anything...",
}: {
  isLLMAnswering: boolean;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStopLLM: () => void;
  uploadedFile?: UploadedFile;
  placeholder?: string;
}) {
  const { refetch } = useUserLimits();

  const handleSendMessage = async () => {
    if (value.trim() === "") return;
    onSend();
    setTimeout(() => {
      refetch();
    }, 1000);
  };

  return (
    <>
      <div className="h-[130px] w-full md:hidden" />
      <div className="w-full md:max-w-2xl mx-auto fixed bottom-0 bg-white md:relative pb-4">
        <PromptInput
          isLLMAnswering={isLLMAnswering}
          value={value}
          onChange={onChange}
          onSend={handleSendMessage}
          uploadedFile={uploadedFile}
          placeholder={placeholder}
          onStopLLM={onStopLLM}
        />
      </div>
    </>
  );
}
