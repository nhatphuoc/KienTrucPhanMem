// facebook-server/src/models/user.js
const sql = require('../config/db'); // Import sql từ Neon

class User {
  static async create({ googleId, username, email, avatar }) {
    const query = sql`
      INSERT INTO users (google_id, username, email, avatar)
      VALUES (${googleId}, ${username}, ${email}, ${avatar})
      RETURNING id, google_id, username, email, avatar
    `;
    const { rows } = await query;
    return rows[0];
  }

  static async findByGoogleId(googleId) {
    const query = sql`
      SELECT * FROM users WHERE google_id = ${googleId}
    `;
    try {
      const { rows } = await query;
      return rows[0] || null; // Trả về bản ghi đầu tiên nếu có, hoặc null nếu không tìm thấy
    } catch (error) {
      return error; // Trả về null nếu có lỗi thay vì ném lỗi
    }
  }

  static async findByEmail(email) {
    const query = sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    const { rows } = await query;
    return rows[0];
  }

  static async findById(id) {
    const query = sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    const { rows } = await query;
    return rows[0];
  }
}

module.exports = User;