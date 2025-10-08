import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: './.env', quiet: true });

const { Client } = pg;

export const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});


// export const db = new pg.Client({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD, 
//   port: process.env.DB_PORT,
// });

db.connect();



