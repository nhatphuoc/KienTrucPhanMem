// facebook-server/src/models/friendRequest.js
const sql = require('../config/db'); // Import sql từ Neon

class FriendRequest {
  static async create(senderId, receiverId) {
    const query = sql`
      INSERT INTO friend_requests (sender_id, receiver_id)
      VALUES (${senderId}, ${receiverId})
      RETURNING *
    `;
    const { rows } = await query;
    return rows[0];
  }

  static async findPending(receiverId) {
    const query = sql`
      SELECT fr.*, u.username, u.avatar
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ${receiverId} AND fr.status = 'pending'
    `;
    const { rows } = await query;
    return rows;
  }

  static async updateStatus(id, status) {
    const query = sql`
      UPDATE friend_requests
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    const { rows } = await query;
    return rows[0];
  }
}

module.exports = FriendRequest;