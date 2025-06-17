// facebook-server/src/controllers/userController.js
const User = require('../models/user');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query.query;
    const users = await User.findByTextSearchQuery('SELECT id, username, email, avatar FROM users WHERE username ILIKE $%1', [`%${query}%`]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};