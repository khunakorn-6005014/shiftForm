const express = require('express');
const router = express.Router();
const { createComment, getCommentById } = require('../controllers/commentController.js');

router.post('/', createComment);
router.get('/:id', getCommentById);

module.exports = router;
