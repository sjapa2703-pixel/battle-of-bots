const Tournament = require('../models/Tournament');
const Match = require('../models/Match');

const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({}).sort({ startDate: 1 });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const matches = await Match.find({ tournamentId: tournament._id })
      .populate('participant1Id', 'nickname avatarUrl')
      .populate('participant2Id', 'nickname avatarUrl')
      .populate('winnerId', 'nickname');

    res.json({ tournament, matches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTournaments,
  getTournamentById,
};
