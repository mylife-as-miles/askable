import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

const isLocal = false; // process.env.NODE_ENV !== "production";

// 50 messages per day
const ratelimit =
  !isLocal && redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.fixedWindow(50, "1 d"),
        analytics: true,
      })
    : undefined;

export const getRemainingMessages = async (userFingerPrint: string) => {
  if (!ratelimit) return { remaining: 50 };
  const result = await ratelimit.getRemaining(userFingerPrint);
  return {
    remaining: result.remaining,
    reset: result.reset,
  };
};

export const limitMessages = async (userFingerPrint: string) => {
  if (!ratelimit) return;
  const result = await ratelimit.limit(userFingerPrint);

  if (!result.success) {
    throw new Error("Too many messages");
  }

  return result;
};
