import { streamText, generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getOpenRouterModel } from '@/lib/ai/openrouter';
import { serializeAIError } from '@/lib/ai/error';

export const runtime = process.env.CHAT_ROUTE_RUNTIME ?? 'nodejs'; // set to 'edge' later if desired

type ChatMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string };

function isMessageArray(x: any): x is ChatMessage[] {
  return Array.isArray(x) && x.every(m => typeof m?.role === 'string' && typeof m?.content === 'string');
}

export async function POST(req: Request) {
  const debug = process.env.DEBUG_AI === 'true';
  const started = Date.now();

  let body: any;
  try {
    const text = await req.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    // Either messages (chat) or prompt (text) are supported by AI SDK. Prefer messages for chat UIs.
    messages,
    prompt,
    model: modelOverride, // optional override, e.g. "anthropic/claude-3.5-sonnet"
    maxTokens,
    temperature,
    // Add any other options you pass through
  } = body ?? {};

  // Validate inputs early so we don't stream an error
  if (!messages && !prompt) {
    return NextResponse.json({ error: 'Provide messages[] or prompt' }, { status: 400 });
  }
  if (messages && !isMessageArray(messages)) {
    return NextResponse.json({ error: 'messages must be an array of {role, content}' }, { status: 400 });
  }

  const model = getOpenRouterModel(modelOverride);

  try {
    if (debug || process.env.FORCE_NON_STREAM === 'true') {
      // Non-streaming path gives clear error details
      const result = await generateText({
        model,
        ...(messages ? { messages } : { prompt }),
        ...(maxTokens ? { maxTokens } : {}),
        ...(temperature !== undefined ? { temperature } : {}),
      });

      return NextResponse.json(
        {
          ok: true,
          text: result.text,
          finishReason: result.finishReason,
          usage: result.usage,
          latencyMs: Date.now() - started,
          warnings: result.warnings,
          provider: 'openrouter',
          model: modelOverride ?? process.env.OPENROUTER_MODEL ?? 'anthropic/claude-3.5-sonnet',
        },
        { status: 200 },
      );
    }

    // Streaming path
    const result = await streamText({
      model,
      ...(messages ? { messages } : { prompt }),
      ...(maxTokens ? { maxTokens } : {}),
      ...(temperature !== undefined ? { temperature } : {}),
      // Useful callbacks for logging:
      onStart: () => {
        console.log(JSON.stringify({ level: 'info', msg: 'AI stream start', t: Date.now(), model: modelOverride ?? process.env.OPENROUTER_MODEL }));
      },
      onToken: (t) => {
        // Light logging; don’t log every token in production
        if (process.env.LOG_TOKENS === 'true') {
          console.log(JSON.stringify({ level: 'debug', msg: 'AI token', t }));
        }
      },
      onFinish: ({ finishReason, usage }) => {
        console.log(JSON.stringify({ level: 'info', msg: 'AI stream finish', finishReason, usage, latencyMs: Date.now() - started }));
      },
      onError: (err) => {
        console.error(JSON.stringify({ level: 'error', msg: 'AI stream error', error: serializeAIError(err) }));
      },
    });

    // This returns the DataStream response that your frontend expects.
    return result.toDataStreamResponse();
  } catch (err: any) {
    // If the provider threw before stream start, surface details here.
    const ser = serializeAIError(err);
    console.error(JSON.stringify({ level: 'error', msg: 'AI route exception', error: ser }));

    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      isProd ? { error: 'Internal Server Error' } : { error: 'AI provider error', details: ser },
      { status: 500 },
    );
  }
}
