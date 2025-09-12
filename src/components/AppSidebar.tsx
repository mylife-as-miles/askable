"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatHistoryMenu } from "@/components/ChatHistoryMenu";
import TooltipUsage from "@/components/TooltipUsage";
import { SquareTerminal, Bot, BookOpen, Settings2, Plus, ChevronsUpDown, Sparkles, BadgeCheck, CreditCard, Bell, LogOut } from "lucide-react";

export function AppSidebar({ chatId }: { chatId?: string }) {
  return (
    <aside
      className={cn(
        `md:flex-col md:w-[60px] md:left-0 md:top-0 items-center border-slate-100 z-20 bg-white
        flex flex-row-reverse justify-between
        transition-transform duration-300 ease-in-out
        md:translate-y-0
        fixed top-0 left-0 right-0
        h-[60px]`,
        "md:h-[calc(100vh)]"
      )}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Icon column */}
      <div className="flex flex-row gap-2.5 text-slate-400 md:flex-col md:gap-4 md:w-full items-center">
        {/* Logo (desktop only) */}
        <Link href="/" className="hidden items-center justify-center md:flex p-4 border-b border-[#F1F5F9]">
          <img src="/logo.svg" className="min-w-[22px]" />
        </Link>

        {/* History */}
        <ChatHistoryMenu chatId={chatId} />

        {/* New chat */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 px-0 cursor-pointer mx-auto bg-transparent border-transparent h-auto text-[#1d293d]">
            <img src="/new.svg" className="size-8 min-w-[32px]" />
          </Button>
        </Link>

        {/* Primary nav icons */}
        <div className="flex flex-row md:flex-col items-center gap-2">
          <Button variant="ghost" size="sm" className="px-0 h-auto"><SquareTerminal className="size-5" /></Button>
          <Button variant="ghost" size="sm" className="px-0 h-auto"><Bot className="size-5" /></Button>
          <Button variant="ghost" size="sm" className="px-0 h-auto"><BookOpen className="size-5" /></Button>
          <Button variant="ghost" size="sm" className="px-0 h-auto"><Settings2 className="size-5" /></Button>
        </div>

        {/* Mobile tooltip usage */}
        <div className="flex md:hidden">
          <TooltipUsage />
        </div>
      </div>

      {/* Bottom user / usage (desktop) */}
      <div className="hidden md:flex flex-col items-center md:mt-auto md:mb-2 md:w-full">
        <TooltipUsage />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-2 w-10 h-10 p-0 rounded-md">
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback className="rounded-md">U</AvatarFallback>
              </Avatar>
              <ChevronsUpDown className="size-3 ml-1 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="min-w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Account</DropdownMenuLabel>
            <DropdownMenuItem><Sparkles className="size-4" /> Upgrade to Pro</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem><BadgeCheck className="size-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem><CreditCard className="size-4" /> Billing</DropdownMenuItem>
            <DropdownMenuItem><Bell className="size-4" /> Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem><LogOut className="size-4" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
