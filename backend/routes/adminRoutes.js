const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.post('/tournaments', createTournament);
router.put('/tournaments/:id', updateTournament);
router.delete('/tournaments/:id', deleteTournament);

router.post('/matches', createMatch);
router.put('/matches/:id', updateMatch);

router.post('/news', createNews);
router.put('/news/:id', updateNews);
router.delete('/news/:id', deleteNews);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
