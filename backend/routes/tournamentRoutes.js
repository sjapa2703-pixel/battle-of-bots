const express = require('express');
const router = express.Router();
const { getTournaments, getTournamentById } = require('../controllers/tournamentController');

router.get('/', getTournaments);
router.get('/:id', getTournamentById);

module.exports = router;
