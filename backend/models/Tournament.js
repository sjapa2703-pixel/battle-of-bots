const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Live', 'Completed'],
    default: 'Upcoming',
  },
  streamUrl: {
    type: String,
  },
  posterUrl: {
    type: String,
  },
  format: {
    type: String,
    enum: ['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss', 'Free-for-all'],
    default: 'Single Elimination',
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { timestamps: true });

const Tournament = mongoose.model('Tournament', tournamentSchema);
module.exports = Tournament;
