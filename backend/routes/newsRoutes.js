const express = require('express');
const router = express.Router();
const { getNews, getNewsById } = require('../controllers/newsController');

router.get('/', getNews);
router.get('/:id', getNewsById);

module.exports = router;
