import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // just in case this file is imported elsewhere before server.js

const isLocal = process.env.LOCAL === "true";

console.log("LOCAL =", process.env.LOCAL, "| Parsed:", isLocal);

export const db = new pg.Client({
  ssl: !isLocal, // disable SSL only when LOCAL=true
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
