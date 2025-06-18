// facebook-server/src/models/user.js
const sql = require('../config/db');

class User {
  static async create({ googleId, username, email, avatar }) {
    if (!googleId) throw new Error('Google ID is required');
    if (!email) throw new Error('Email is required');
    if (!username) throw new Error('Username is required');
    try {
      const result = await sql`
        INSERT INTO users (google_id, username, email, avatar)
        VALUES (${googleId}, ${username}, ${email}, ${avatar || null})
        ON CONFLICT (google_id) DO UPDATE
        SET username = EXCLUDED.username,
            email = EXCLUDED.email,
            avatar = EXCLUDED.avatar
        RETURNING id, google_id, username, email, avatar
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to create or update user: no rows returned');
      }
      console.log('Created/Updated user:', result[0]);
      return result[0];
    } catch (err) {
      console.error('User create error:', err.message, err.stack);
      throw err;
    }
  }

  static async findByGoogleId(googleId) {
    if (!googleId) throw new Error('Google ID is required');
    try {
      const result = await sql`
        SELECT id, google_id, username, email, avatar
        FROM users
        WHERE google_id = ${googleId}
      `;
      console.log('Found user by googleId:', result[0] || null);
      return result[0] || null;
    } catch (err) {
      console.error('Find by googleId error:', err.message, err.stack);
      throw err;
    }
  }

  static async findByEmail(email) {
    if (!email) throw new Error('Email is required');
    try {
      const result = await sql`
        SELECT id, google_id, username, email, avatar
        FROM users
        WHERE email = ${email}
      `;
      console.log('Found user by email:', result[0] || null);
      return result[0] || null;
    } catch (err) {
      console.error('Find by email error:', err.message, err.stack);
      throw err;
    }
  }

  static async findById(id) {
    if (!id) throw new Error('ID is required');
    try {
      const result = await sql`
        SELECT id, google_id, username, email, avatar
        FROM users
        WHERE id = ${id}
      `;
      console.log('Found user by id:', result[0] || null);
      return result[0] || null;
    } catch (err) {
      console.error('Find by id error:', err.message, err.stack);
      throw err;
    }
  }
}

module.exports = User;