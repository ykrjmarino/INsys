import { createClient } from 'redis';
import dotenv from "dotenv"
dotenv.config();
const redisClient = createClient({
  url: process.env.LOCAL ? '' : 'redis://default:0dYFNg4q8RldJx3wrrrAXooB1blkCvLk@redis-12975.c261.us-east-1-4.ec2.redns.redis-cloud.com:12975'
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error: ", err);
});

await redisClient.connect();

export default redisClient;