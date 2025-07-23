const express = require('express');
const router = express.Router();
const { createUser, login, getUserById } = require('../controllers/userController');

router.post('/', createUser);
router.post('/login', login);
router.get('/:id', getUserById);

module.exports = router;