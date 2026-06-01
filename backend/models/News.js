const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  imageUrl: {
    type: String,
  },
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);
module.exports = News;
