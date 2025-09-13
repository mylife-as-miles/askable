import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getOpenRouterModel } from '../../../lib/ai/openrouter';
import { serializeAIError } from '../../../lib/ai/error';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messages, prompt, model: modelOverride, maxTokens, temperature } = body ?? {};
  const model = getOpenRouterModel(modelOverride);

  try {
    const result = await generateText({
      model,
      ...(messages ? { messages } : { prompt }),
      ...(maxTokens ? { maxTokens } : {}),
      ...(temperature !== undefined ? { temperature } : {}),
    });

    return NextResponse.json(
      { ok: true, text: result.text, finishReason: result.finishReason, usage: result.usage, warnings: result.warnings },
      { status: 200 },
    );
  } catch (err: any) {
    const ser = serializeAIError(err);
    console.error(JSON.stringify({ level: 'error', msg: 'chat-debug error', error: ser }));
    return NextResponse.json({ error: 'AI provider error', details: ser }, { status: 502 });
  }
}
