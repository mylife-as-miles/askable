import Together from "together-ai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { Redis } from "@upstash/redis";

const APP_NAME_HELICONE = "askable";

let _togetherClient: Together | null = null;

function buildTogetherOptions(): ConstructorParameters<typeof Together>[0] {
  const apiKey = process.env.TOGETHER_API_KEY;
  const opts: ConstructorParameters<typeof Together>[0] = {
    apiKey,
  };
  if (process.env.HELICONE_API_KEY) {
    opts.baseURL = "https://together.helicone.ai/v1";
    opts.defaultHeaders = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-Appname": APP_NAME_HELICONE,
    };
  }
  return opts;
}

export function getTogetherClient(): Together {
  if (_togetherClient) return _togetherClient;
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error(
      "TOGETHER_API_KEY is not set. Please set it in your environment to use Together AI."
    );
  }
  _togetherClient = new Together(buildTogetherOptions());
  return _togetherClient;
}

export const togetherAISDKClient = createTogetherAI({
  // Passing possibly undefined apiKey here is okay at build time; the SDK will error only when used.
  apiKey: process.env.TOGETHER_API_KEY || "",
  baseURL: "https://together.helicone.ai/v1",
  headers: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY || ""}`,
    "Helicone-Property-AppName": APP_NAME_HELICONE,
  },
});

export function getCodeInterpreter() {
  return getTogetherClient().codeInterpreter;
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
