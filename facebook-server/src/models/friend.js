// facebook-server/src/models/friend.js
const sql = require('../config/db'); // Import sql từ Neon

class Friend {
  static async create(userId, friendId) {
    const query = sql`
      INSERT INTO friends (user_id, friend_id)
      VALUES (${userId}, ${friendId}), (${friendId}, ${userId})
      RETURNING *
    `;
    const { rows } = await query;
    return rows;
  }

  static async findFriends(userId) {
    const query = sql`
      SELECT u.id, u.username, u.avatar
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ${userId}
    `;
    const { rows } = await query;
    return rows;
  }
}

module.exports = Friend;