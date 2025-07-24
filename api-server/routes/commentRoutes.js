const express = require('express');
const router = express.Router();
const { createComment, getCommentById, getAllComments, getAllUserComments, updateCommentById, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', createComment);
router.get('/:id', getCommentById);
router.get('/user/:userId', getAllUserComments);
router.patch('/', updateCommentById);

// Admin Only
router.get('/', protect, getAllComments);
router.delete('/:id', protect, deleteComment);

module.exports = router;
