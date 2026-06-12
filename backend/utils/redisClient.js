import { createClient } from 'redis';
import dotenv from "dotenv"
dotenv.config();
const redisClient = createClient({
  url: process.env.LOCAL 
    ? "redis://127.0.0.1:6379" 
    : process.env.REDIS_URL
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error: ", err);
});

await redisClient.connect();

export default redisClient;