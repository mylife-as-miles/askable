import { runQuery } from './clients';

const isLocal = process.env.NODE_ENV !== "production";
const dailyLimit = 50; // 50 messages per day
const windowSec = 24 * 60 * 60; // 24 hours

export async function getRemainingMessages(userFingerPrint: string): Promise<{ remaining: number; reset: number }> {
    if (isLocal) return { remaining: dailyLimit, reset: new Date().getTime() + windowSec * 1000 };

    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSec;
    const [rows] = await runQuery<any>(
        'SELECT COUNT(*) as cnt FROM rate_limits WHERE id = ? AND timestamp >= FROM_UNIXTIME(?)',
        [userFingerPrint, windowStart]
    );
    const count = rows?.[0]?.cnt ?? 0;
    const remaining = dailyLimit - count;

    const [latest] = await runQuery<any>(
        'SELECT timestamp FROM rate_limits WHERE id = ? ORDER BY timestamp DESC LIMIT 1',
        [userFingerPrint]
    );
    const reset = latest?.[0]?.timestamp ? new Date(latest[0].timestamp).getTime() + windowSec * 1000 : new Date().getTime() + windowSec * 1000;

    return { remaining: remaining > 0 ? remaining : 0, reset };
}

export async function limitMessages(userFingerPrint: string): Promise<void> {
    if (isLocal) return;

    const { remaining } = await getRemainingMessages(userFingerPrint);
    if (remaining <= 0) {
        throw new Error("Too many messages");
    }
    await runQuery('INSERT INTO rate_limits (id, timestamp) VALUES (?, NOW())', [userFingerPrint]);
}
