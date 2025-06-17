// facebook-server/src/config/db.js
require('dotenv').config(); // Đảm bảo tải biến môi trường
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false } // Bỏ qua kiểm tra chứng chỉ SSL
});

module.exports = sql;