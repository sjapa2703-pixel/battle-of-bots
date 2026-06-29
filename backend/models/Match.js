const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  participant1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  participant2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'InProgress', 'Completed'],
    default: 'Scheduled',
  },
  scheduledAt: {
    type: Date,
  },
  videoUrl: {
    type: String,
  },
  round: {
    type: Number,
  },
  matchNumber: {
    type: Number,
  },
  nextMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
  },
}, { timestamps: true });

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
