"use client";
import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function ChatHistoryMenu({ chatId }: { chatId?: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [chatLinks, setChatLinks] = useState<{ id: string; title: string }[]>(
    []
  );
  const [isLoading, setLoading] = useState(true);

  // Badge component for notification bubble
  const ChatBadge = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    const displayCount = count > 99 ? "99+" : count;
    return (
      <span
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          transform: "translate(40%, -50%)",
          background: "#ef4444", // Tailwind red-500
          color: "white",
          borderRadius: "9999px",
          minWidth: "16px",
          height: "16px",
          lineHeight: "16px",
          fontSize: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 4px",
          fontWeight: 700,
          zIndex: 10,
          boxShadow: "0 0 0 2px white",
        }}
        aria-label={`You have ${displayCount} chats`}
      >
        {displayCount}
      </span>
    );
  };

  // Track visited chat ids in localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && chatId) {
      const key = "visitedChatIds";
      let ids: string[] = [];
      try {
        ids = JSON.parse(localStorage.getItem(key) || "[]");
      } catch {}
      if (!ids.includes(chatId)) {
        ids.push(chatId);
        localStorage.setItem(key, JSON.stringify(ids));
      }
    }
  }, [chatId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "visitedChatIds";
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {}
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    // Fetch chat metadata from backend
    fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChatLinks(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const HistoryLinks = () => {
    return (
      <div className="flex flex-col gap-2 pb-8 md:pb-5 mx-1.5">
        {chatLinks.map((chat) => {
          const href = `/chat/${chat.id}`;
          const isActive = pathname === href;
          return (
            <Fragment key={chat.id}>
              <Link
                key={chat.id}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={`text-sm text-left py-2.5 px-6 md:py-2 md:px-4 ${
                  isActive
                    ? "bg-slate-200 rounded font-medium text-[#0f172b]"
                    : "text-[#314158]"
                }`}
              >
                {chat.title}
              </Link>
            </Fragment>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[32px] items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {}}
          className="cursor-progress !p-1 mx-auto relative"
        >
          <span style={{ position: "relative", display: "inline-block" }}>
            <img src="/history.svg" className="size-9" />
            <ChatBadge count={chatLinks.length} />
          </span>
        </Button>
      </div>
    );
  }

  if (chatLinks.length === 0) {
    return (
      <div className="flex h-[32px] items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="cursor-not-allowed !p-1 mx-auto relative"
        >
          <span style={{ position: "relative", display: "inline-block" }}>
            <img src="/history.svg" className="size-9" />
            {/* No badge if no chats */}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: DropdownMenu, Mobile: Drawer */}
      <div className="hidden md:flex h-[32px] items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer !p-1 mx-auto relative"
            >
              <span style={{ position: "relative", display: "inline-block" }}>
                <img src="/history.svg" className="size-9" />
                <ChatBadge count={chatLinks.length} />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="!p-0">
            <p className="text-sm font-medium text-left text-[#314158] px-3 py-4 border-b border-b-[#CAD5E2] mb-4 min-w-3xs">
              Chat History
            </p>
            <HistoryLinks />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="md:hidden flex items-center justify-center">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer !p-1 mx-auto relative"
            >
              <span style={{ position: "relative", display: "inline-block" }}>
                <img src="/history.svg" className="size-9" />
                <ChatBadge count={chatLinks.length} />
              </span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="!bg-slate-100 !border-[0.5px] !border-[#45556c] pt-6">
            <VisuallyHidden asChild>
              <DrawerTitle>Chat History</DrawerTitle>
            </VisuallyHidden>
            <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10">
              <svg
                width="164"
                height="4"
                viewBox="0 0 164 4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="164" height="4" rx="2" fill="#E2E8F0" />
              </svg>
            </div>
            <HistoryLinks />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
