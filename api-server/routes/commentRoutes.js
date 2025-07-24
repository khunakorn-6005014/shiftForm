const express = require('express');
const router = express.Router();
const { createComment, getCommentById, getAllComments, getAllUserComments } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', createComment);
router.get('/:id', getCommentById);
router.get('/user/:userId', getAllUserComments);

// Admin Only
router.get('/', protect, getAllComments);

module.exports = router;
