
import { createClient } from "redis";
let redisClient;

export const connectRedis = async () => {
  if (!redisClient) {
    redisClient = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOSTNAME,
        port: process.env.REDIS_PORT,
      },
    });

    redisClient.on("error", (err) => console.log("Redis Client Error", err));

    try {
      await redisClient.connect();
      console.log("Worker Connected to our Redis instance!!");
    } catch (error) {
      console.log("Error connecting to Redis:", error);
    }
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not connected");
  }
  return redisClient;
};
