import { createClient } from 'redis';
import dotenv from "dotenv"
dotenv.config();
const redisClient = createClient({
  url: process.env.LOCAL ? '' : 'redis://red-d3j4u8mmcj7s739ma92g:s2wMPEzbk1lGkhQ8xWFyqmvz27HwgJZN@red-d3j4u8mmcj7s739ma92g:6379'
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error: ", err);
});

await redisClient.connect();

export default redisClient;