const News = require('../models/News');

const getNews = async (req, res) => {
  try {
    const news = await News.find({})
      .sort({ publishedAt: -1 })
      .populate('authorId', 'nickname avatarUrl');
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('authorId', 'nickname avatarUrl');
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNews,
  getNewsById,
};
