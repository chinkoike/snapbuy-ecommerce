import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err: any) => console.error("Redis Error:", err));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Connected to Cloud Redis (Upstash)");
    }
  } catch (err) {
    console.error("Could not connect to Redis:", err);
  }
};

export default redisClient;
