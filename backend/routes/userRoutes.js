const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUserProfile, checkNickname } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getUsers);
router.post('/check-nickname', checkNickname);
router.get('/:id', getUserById);
router.put('/me', protect, updateUserProfile);

module.exports = router;
