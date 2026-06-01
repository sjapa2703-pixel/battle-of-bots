const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const News = require('../models/News');
const User = require('../models/User');

const createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create(req.body);
    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (tournament) {
      tournament.title = req.body.title || tournament.title;
      tournament.description = req.body.description || tournament.description;
      tournament.startDate = req.body.startDate || tournament.startDate;
      tournament.endDate = req.body.endDate || tournament.endDate;
      tournament.status = req.body.status || tournament.status;
      tournament.streamUrl = req.body.streamUrl || tournament.streamUrl;
      tournament.posterUrl = req.body.posterUrl || tournament.posterUrl;

      const updatedTournament = await tournament.save();
      res.json(updatedTournament);
    } else {
      res.status(404).json({ message: 'Tournament not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMatch = async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (match) {
      match.winnerId = req.body.winnerId || match.winnerId;
      match.status = req.body.status || match.status;
      match.scheduledAt = req.body.scheduledAt || match.scheduledAt;
      match.videoUrl = req.body.videoUrl || match.videoUrl;

      const updatedMatch = await match.save();
      res.json(updatedMatch);
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNews = async (req, res) => {
  try {
    const news = await News.create({
      ...req.body,
      authorId: req.user._id,
    });
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (news) {
      await news.deleteOne();
      res.json({ message: 'News removed' });
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (tournament) {
      await tournament.deleteOne();
      res.json({ message: 'Tournament removed' });
    } else {
      res.status(404).json({ message: 'Tournament not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (news) {
      news.title = req.body.title || news.title;
      news.content = req.body.content || news.content;
      const updatedNews = await news.save();
      res.json(updatedNews);
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.nickname = req.body.nickname || user.nickname;
      user.role = req.body.role || user.role;
      if (req.body.wins !== undefined) user.wins = req.body.wins;
      if (req.body.losses !== undefined) user.losses = req.body.losses;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTournament,
  updateTournament,
  deleteTournament,
  createMatch,
  updateMatch,
  createNews,
  updateNews,
  deleteNews,
  getUsers,
  updateUser,
  deleteUser,
};
