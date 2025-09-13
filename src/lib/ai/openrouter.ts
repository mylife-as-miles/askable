import { createOpenAI } from '@ai-sdk/openai';

function required(name: string, val: string | undefined) {
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

const baseURL = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';
const apiKey = required('OPENROUTER_API_KEY', process.env.OPENROUTER_API_KEY);

// These are recommended by OpenRouter for routing/analytics (optional but useful).
const referer = process.env.OPENROUTER_REFERRER ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const title = process.env.OPENROUTER_APP_NAME ?? 'My App';

export const openrouter = createOpenAI({
  baseURL,
  apiKey,
  headers: {
    'HTTP-Referer': referer,
    'X-Title': title,
  },
});

// Default model can be controlled by env; override per-call if you prefer.
export function getOpenRouterModel(name?: string) {
  const model =
    name ??
    process.env.OPENROUTER_MODEL ?? // e.g. "anthropic/claude-3.5-sonnet" or "meta-llama/llama-3.1-70b-instruct"
    'anthropic/claude-3.5-sonnet';
  return openrouter(model);
}
