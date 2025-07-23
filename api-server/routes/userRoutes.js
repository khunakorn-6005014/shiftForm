const express = require('express');
const router = express.Router();
const { createUser, login, getUserById, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', createUser);
router.post('/login', login);
router.get('/:id', getUserById);

// Admin Only
router.get('/', protect, getAllUsers);

module.exports = router;