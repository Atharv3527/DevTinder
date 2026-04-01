import { createClient } from "redis";

const REDIS_URL = (process.env.REDIS_URL || "").trim();

let redisClient = null;
let redisReady = false;

if (REDIS_URL) {
  redisClient = createClient({ url: REDIS_URL });

  redisClient.on("error", (err) => {
    redisReady = false;
    console.warn("Redis error:", err.message);
  });

  redisClient.on("ready", () => {
    redisReady = true;
    console.log("Redis connected");
  });

  redisClient.connect().catch((err) => {
    console.warn("Redis connect failed:", err.message);
    redisReady = false;
  });
} else {
  console.log("Redis disabled (REDIS_URL not set)");
}

function canUseRedis() {
  return !!redisClient && redisReady;
}

export async function getCache(key) {
  if (!canUseRedis()) return null;
  try {
    const data = await redisClient.get(key);
    if (process.env.NODE_ENV !== "production") {
      console.log(data ? "Cache HIT:" : "Cache MISS:", key);
    }
    return data;
  } catch (err) {
    console.warn("Redis GET failed:", err.message);
    return null;
  }
}

export async function setCache(key, value, ttlSeconds) {
  if (!canUseRedis()) return;
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.warn("Redis SET failed:", err.message);
  }
}

export async function deleteCache(key) {
  if (!canUseRedis()) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    console.warn("Redis DEL failed:", err.message);
  }
}

export async function deleteByPrefix(prefix) {
  if (!canUseRedis()) return;
  try {
    const keys = [];
    for await (const key of redisClient.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100,
    })) {
      keys.push(key);
    }
    if (!keys.length) return;
    await redisClient.del(keys);
  } catch (err) {
    console.warn("Redis prefix delete failed:", err.message);
  }
}
