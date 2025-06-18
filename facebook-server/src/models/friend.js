// facebook-server/src/models/friend.js
const sql = require('../config/db');

class Friend {
  static async create(userId, friendId) {
    if (!userId) throw new Error('User ID is required');
    if (!friendId) throw new Error('Friend ID is required');
    if (userId === friendId) throw new Error('Cannot add self as friend');
    try {
      const result = await sql`
        INSERT INTO friends (user_id, friend_id)
        VALUES (${userId}, ${friendId}), (${friendId}, ${userId})
        ON CONFLICT DO NOTHING
        RETURNING user_id, friend_id
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to create friendship: no rows affected');
      }
      console.log('Created friendship:', result);
      return result;
    } catch (err) {
      console.error('Friend create error:', err.message, err.stack);
      throw err;
    }
  }

  static async findFriends(userId) {
    if (!userId) throw new Error('User ID is required');
    try {
      const result = await sql`
        SELECT u.id, u.username, u.avatar
        FROM friends f
        JOIN users u ON f.friend_id = u.id
        WHERE f.user_id = ${userId}
      `;
      console.log('Found friends:', result);
      return result;
    } catch (err) {
      console.error('Find friends error:', err.message, err.stack);
      throw err;
    }
  }
}

module.exports = Friend;