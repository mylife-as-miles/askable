import React from "react";
import { CodeDemo } from "@/components/CodeDemo";

export function HeroSection() {
  return (
    <div className="w-full flex flex-col md:flex-row items-center md:items-start md:justify-between gap-8">
      <div className="max-w-[277px] md:max-w-[420px] flex flex-col items-center md:items-start">
        <img src="/logo.svg" className="size-[42px]  mb-8" />
        {/* Title */}
        <h1 className="text-[28px] font-medium text-slate-900 text-center md:text-left mb-8 leading-tight">
          What do you want to analyze?
        </h1>
      </div>
      <div className="hidden md:block">
        <CodeDemo duration={8} delay={0.3} writing={true} cursor={true} />
      </div>
    </div>
  );
}
