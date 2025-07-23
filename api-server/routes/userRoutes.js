const express = require('express');
const router = express.Router();
const { createUser, login, getUserById, getAllUsers, updateUserById, deleteUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', createUser);
router.post('/login', login);
router.get('/:id', getUserById);

// Admin & Own User
router.patch('/:id', protect, updateUserById);

// Admin Only
router.get('/', protect, getAllUsers);
router.delete('/:id', protect, deleteUser);

module.exports = router;