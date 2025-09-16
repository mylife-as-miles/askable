"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ChatHistoryMenu({ chatId }: { chatId?: string }) {
  const [chatLinks, setChatLinks] = useState<{ id: string; title: string }[]>(
    []
  );
  const [isLoading, setLoading] = useState(true);
  const pathname = usePathname();
  const { open, animate } = useSidebar();
  const [hasAny, setHasAny] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "visitedChatIds";
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {}
    setHasAny(ids.length > 0);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    // Try backend for enriched titles
    if (typeof window === "undefined") return; // avoid during build/SSR
    fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("history fetch failed");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setChatLinks(data);
          return;
        }
        throw new Error("empty history");
      })
      .catch(() => {
        // Fallback: read minimal metadata from localStorage
        const metas = ids
          .map((id) => {
            try {
              const raw = localStorage.getItem(`chatMeta:${id}`);
              if (!raw) return null;
              const meta = JSON.parse(raw);
              return { id, title: meta?.title || id, createdAt: meta?.createdAt };
            } catch {
              return { id, title: id };
            }
          })
          .filter(Boolean) as { id: string; title: string; createdAt?: string }[];
        if (metas.length > 0) {
          metas.sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          });
          setChatLinks(metas.map((m) => ({ id: m.id, title: m.title })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClear = () => {
    try {
      const key = "visitedChatIds";
      const raw = localStorage.getItem(key);
      let ids: string[] = [];
      try { ids = JSON.parse(raw || "[]"); } catch {}
      ids.forEach((id) => localStorage.removeItem(`chatMeta:${id}`));
      localStorage.removeItem(key);
      setChatLinks([]);
      setHasAny(false);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-2">
  <div className="h-8 w-full bg-muted rounded-lg animate-pulse" />
        <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
        <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header actions */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-muted-foreground">History</span>
        {hasAny && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            onClick={handleClear}
          >
            Clear
          </button>
        )}
      </div>

      {!isLoading && chatLinks.length === 0 && (
        <div className="px-2 py-1 text-xs text-muted-foreground">No recent chats</div>
      )}
      {chatLinks.map((chat) => {
        const href = `/chat/${chat.id}`;
        const isActive = pathname === href;
        return (
          <Link
            key={chat.id}
            href={href}
            className={cn(
              "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg hover:bg-sidebar-accent",
              isActive && "bg-sidebar-accent"
            )}
          >
            <MessageSquare className="text-foreground h-5 w-5 flex-shrink-0" />
            <motion.span
              animate={{
                display: animate ? (open ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="text-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 max-w-[180px] truncate"
            >
              {chat.title}
            </motion.span>
          </Link>
        );
      })}
    </div>
  );
}
