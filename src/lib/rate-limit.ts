import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

function getRateLimitInstance() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "salidas-pedagogicas",
    });
  }

  return ratelimit;
}

export async function limitTripCreation(userId: string) {
  const limiter = getRateLimitInstance();

  if (!limiter) {
    return {
      success: true,
      limit: null,
      reset: null,
      remaining: null,
    };
  }

  return limiter.limit(`crear-salida:${userId}`);
}