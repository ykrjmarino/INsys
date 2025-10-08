// import { createClient } from 'redis';

// const redisClient = createClient();

// redisClient.on("error", (err) => {
//   console.error("Redis Client Error: ", err);
// });

// await redisClient.connect();

// export default redisClient;



import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: { tls: true, rejectUnauthorized: false },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error: ", err);
});

await redisClient.connect();

export default redisClient;
