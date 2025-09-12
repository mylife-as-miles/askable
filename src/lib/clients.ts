import { createOpenAI } from "@ai-sdk/openai";
import { Redis } from "@upstash/redis";
import { APP_NAME } from "@/lib/utils";

export const openRouterClient = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  headers: {
    // Optional recommended headers for OpenRouter
    "HTTP-Referer": process.env.OPENROUTER_REFERER || "",
    "X-Title": process.env.OPENROUTER_TITLE || APP_NAME,
  },
  baseURL: "https://openrouter.ai/api/v1",
});

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
