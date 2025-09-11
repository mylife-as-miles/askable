import Together from "together-ai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { Redis } from "@upstash/redis";

const APP_NAME_HELICONE = "askable";

const baseSDKOptions: ConstructorParameters<typeof Together>[0] = {
  apiKey: process.env.TOGETHER_API_KEY,
};

if (process.env.HELICONE_API_KEY) {
  baseSDKOptions.baseURL = "https://together.helicone.ai/v1";
  baseSDKOptions.defaultHeaders = {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-Property-Appname": APP_NAME_HELICONE,
  };
}

export const togetherClient = new Together(baseSDKOptions);

export const togetherAISDKClient = createTogetherAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://together.helicone.ai/v1",
  headers: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-Property-AppName": APP_NAME_HELICONE,
  },
});

export const codeInterpreter = togetherClient.codeInterpreter;

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
