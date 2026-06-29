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

const generateBracket = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    // Clear existing matches
    await Match.deleteMany({ tournamentId: tournament._id });

    let participants = [...tournament.participants];
    // For simplicity, assume 2, 4, 8, 16 etc. We'll pad with nulls to nearest power of 2
    let power = 1;
    while (power < participants.length) power *= 2;
    while (participants.length < power) participants.push(null);

    // Shuffle
    participants.sort(() => Math.random() - 0.5);

    let matches = [];
    let matchCounter = 1;
    
    let previousRoundMatches = [];
    
    // Create first round
    let currentRoundMatches = [];
    for (let i = 0; i < participants.length; i += 2) {
      let m = new Match({
        tournamentId: tournament._id,
        participant1Id: participants[i],
        participant2Id: participants[i+1],
        round: 1,
        matchNumber: matchCounter++,
        status: (participants[i] === null || participants[i+1] === null) ? 'Completed' : 'Scheduled',
        winnerId: (participants[i] === null) ? participants[i+1] : ((participants[i+1] === null) ? participants[i] : null)
      });
      currentRoundMatches.push(m);
    }
    previousRoundMatches = [...currentRoundMatches];
    matches.push(...currentRoundMatches);

    // Create subsequent rounds
    let roundNum = 2;
    while (previousRoundMatches.length > 1) {
      currentRoundMatches = [];
      for (let i = 0; i < previousRoundMatches.length; i += 2) {
        let m = new Match({
          tournamentId: tournament._id,
          round: roundNum,
          matchNumber: matchCounter++,
          status: 'Scheduled',
        });
        currentRoundMatches.push(m);
        // Link previous matches to this one
        previousRoundMatches[i].nextMatchId = m._id;
        previousRoundMatches[i+1].nextMatchId = m._id;
      }
      matches.push(...currentRoundMatches);
      previousRoundMatches = [...currentRoundMatches];
      roundNum++;
    }

    // Save all
    for (let m of matches) {
      await m.save();
    }

    res.json({ message: 'Bracket generated', matches });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      tournament.streamUrl = req.body.streamUrl !== undefined ? req.body.streamUrl : tournament.streamUrl;
      tournament.posterUrl = req.body.posterUrl !== undefined ? req.body.posterUrl : tournament.posterUrl;
      if (req.body.participants) {
        tournament.participants = req.body.participants;
      }

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
      const oldWinnerId = match.winnerId ? match.winnerId.toString() : null;
      
      match.winnerId = req.body.winnerId !== undefined ? req.body.winnerId : match.winnerId;
      match.status = req.body.status || match.status;
      match.scheduledAt = req.body.scheduledAt || match.scheduledAt;
      match.videoUrl = req.body.videoUrl !== undefined ? req.body.videoUrl : match.videoUrl;
      match.participant1Id = req.body.participant1Id !== undefined ? (req.body.participant1Id || null) : match.participant1Id;
      match.participant2Id = req.body.participant2Id !== undefined ? (req.body.participant2Id || null) : match.participant2Id;

      if (req.body.winnerId && req.body.winnerId !== oldWinnerId && match.nextMatchId) {
         const nextMatch = await Match.findById(match.nextMatchId);
         if (nextMatch) {
             const prevMatches = await Match.find({ nextMatchId: nextMatch._id }).sort('matchNumber');
             if (prevMatches.length > 0 && prevMatches[0]._id.toString() === match._id.toString()) {
                 nextMatch.participant1Id = match.winnerId;
             } else {
                 nextMatch.participant2Id = match.winnerId;
             }
             await nextMatch.save();
         }
      }

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
  generateBracket,
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
