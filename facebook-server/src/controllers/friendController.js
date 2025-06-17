// facebook-server/src/controllers/friendController.js
const Friend = require('../models/friend');
const FriendRequest = require('../models/friendRequest');
const User = require('../models/user');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendEmail } = req.body;
    const senderId = req.user.id;
    const friend = await User.findByEmail(friendEmail);
    if (!friend) return res.status(404).json({ error: 'User not found' });

    const request = await FriendRequest.create(senderId, friend.id);
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.acceptFriendRequest = async (req, res) => {
try {
const { requestId } = req.body;
const request = await FriendRequest.updateStatus(requestId, 'accepted');
await Friend.create(req.user.id, request.sender_id);
res.json({ success: 'Friend request accepted' });
} catch (err) {
res.status(500).json({ error: 'Server error' });
}
};

exports.rejectFriendRequest = async (req, res) => {
try {
const { requestId } = req.body;
await FriendRequest.updateStatus(requestId, 'rejected');
res.json({ success: 'Friend request rejected' });
} catch (err) {
res.status(500).json({ error: 'Server error' });
}
};

exports.getFriends = async (req, res) => {
try {
const friends = await Friend.findFriends(req.user.id);
res.json(friends);
} catch (err) {
res.status(500).json({ error: 'Server error' });
}
};
exports.getPendingRequests = async (req, res) => {
try {
const requests = await FriendRequest.findPending(req.user.id);
res.json(requests);
} catch (err) {
res.status(500).json({ error: 'Server error' });
}
};