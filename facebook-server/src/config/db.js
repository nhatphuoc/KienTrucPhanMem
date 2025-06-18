// facebook-server/src/config/db.js
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

sql`SELECT 1`
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Database connection error:', err.message, err.stack);
    process.exit(1);
  });

module.exports = sql;