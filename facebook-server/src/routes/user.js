// facebook-server/src/routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/:id', authMiddleware, userController.getProfile);
router.get('/search', authMiddleware, userController.searchUsers);

module.exports = router;