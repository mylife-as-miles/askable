"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ModelDropdown } from "./ModelDropdown";
import { useLLMModel } from "@/hooks/useLLMModel";
import { useEffect, useRef } from "react";
import { cn, UploadedFile } from "@/lib/utils";
import { DropdownFileActions } from "./DropdownFileActions";

export function PromptInput({
  isLLMAnswering,
  onStopLLM,
  textAreaClassName,
  value,
  onChange,
  onSend,
  uploadedFile,
  placeholder = "Ask anything...",
}: {
  isLLMAnswering: boolean;
  onStopLLM: () => void;
  textAreaClassName?: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  uploadedFile?: UploadedFile;
  placeholder?: string;
}) {
  const { selectedModelSlug, setModel, models } = useLLMModel();
  // Autofocus logic
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");
    onChange(pastedText.trim());
    e.preventDefault(); // Prevent default paste behavior
  };

  return (
    <div className="relative border border-[#cad5e2] shadow rounded-lg p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full resize-none text-base placeholder:text-slate-400 focus:outline-none ",
          textAreaClassName
        )}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />

      <div className="flex flex-row justify-between gap-4">
        <ModelDropdown
          models={models}
          value={selectedModelSlug}
          onChange={setModel}
        />

        <div className="flex flex-row gap-2">
          {uploadedFile && (
            <div
              className="flex flex-row items-center justify-center min-w-[128px] relative overflow-hidden gap-1.5 pl-2 pr-1 py-1.5 rounded-sm max-h-[28px] bg-slate-100 border-[0.5px] border-[#90a1b9] md:pl-4 md:pr-2 md:py-3.5"
              style={{ boxShadow: "0px 1px 7px -3px rgba(0,0,0,0.25)" }}
            >
              <img src="/uploaded-file.svg" alt="" className="w-4 h-4" />
              <div className="flex justify-center items-center  relative gap-1.5">
                <div className="flex flex-col justify-start items-start  relative gap-1">
                  <p
                    className="w-[64px] md:w-[100px] text-xs font-medium text-left text-[#1d293d] truncate"
                    title={
                      uploadedFile.name ||
                      uploadedFile?.url?.split("/").pop() ||
                      ""
                    }
                  >
                    {uploadedFile.name || uploadedFile?.url?.split("/").pop()}
                  </p>
                </div>
              </div>
              <DropdownFileActions uploadedFile={uploadedFile} />
            </div>
          )}

          {isLLMAnswering ? (
            <Button
              onClick={onStopLLM}
              size="sm"
              className="p-0 bg-[#1D293D] disabled:bg-slate-400 hover:bg-slate-500 size-[28px] flex items-center justify-center cursor-pointer rounded-sm"
            >
              <img src="/stop.svg" className="size-3" />
            </Button>
          ) : (
            <Button
              onClick={onSend}
              disabled={!value.trim()}
              size="sm"
              className="p-0 bg-[#1D293D] disabled:bg-slate-400 hover:bg-slate-500 size-[28px] flex items-center justify-center cursor-pointer rounded-sm"
            >
              <img src="/send.svg" className="size-2.5 min-w-2.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
