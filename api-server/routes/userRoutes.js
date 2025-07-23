const express = require('express');
const router = express.Router();
const { createUser, login } = require('../controllers/userController');

router.post('/', createUser);
router.post('/login', login);

module.exports = router;