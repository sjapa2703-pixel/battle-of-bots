const User = require('../models/User');
const Match = require('../models/Match');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ wins: -1 }).select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash').populate('friends', 'nickname avatarUrl');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const matches = await Match.find({
      $or: [{ participant1Id: req.params.id }, { participant2Id: req.params.id }]
    }).populate('tournamentId', 'title');

    res.json({ user, matches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.nickname = req.body.nickname || user.nickname;
      user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkNickname = async (req, res) => {
  try {
    const { nickname } = req.body;
    const user = await User.findOne({ nickname });
    if (user) {
      return res.json({ available: false });
    }
    res.json({ available: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
  checkNickname
};
