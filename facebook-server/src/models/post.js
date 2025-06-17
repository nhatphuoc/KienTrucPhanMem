// facebook-server/src/models/post.js
const sql = require('../config/db'); // Import sql từ Neon

class Post {
  static async create({ userId, content, imageUrl }) {
    const query = sql`
      INSERT INTO posts (user_id, content, image_url)
      VALUES (${userId}, ${content}, ${imageUrl})
      RETURNING *
    `;
    const { rows } = await query;
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = sql`
      SELECT p.*, u.username, u.avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ${userId}
      ORDER BY p.created_at DESC
    `;
    const { rows } = await query;
    return rows;
  }

  static async findById(id) {
    const query = sql`
      SELECT p.*, u.username, u.avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${id}
    `;
    const { rows } = await query;
    return rows[0];
  }

  static async update(id, { content, imageUrl }) {
    const query = sql`
      UPDATE posts
      SET content = ${content}, image_url = ${imageUrl}
      WHERE id = ${id}
      RETURNING *
    `;
    const { rows } = await query;
    return rows[0];
  }

  static async delete(id) {
    const query = sql`
      DELETE FROM posts WHERE id = ${id}
    `;
    await query;
  }
}

module.exports = Post;