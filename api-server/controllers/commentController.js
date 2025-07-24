const Comment = require('../models/comment.js');

// Get Comment by Id
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json(comment);
  } catch (err) {
    console.error('Error fetching comment by ID:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Comment
const createComment = async (req, res) => {
    try {
        const { description } = req.body.comment;
        const user = req.body.user;

        if (!user || !user._id) {
            return res.status(401).json({ error: 'User not found' });
        }

        const newComment = new Comment({
            userId: user._id,
            description
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create comment', details: err.message });
    }
};

module.exports = { 
    createComment, 
    getCommentById
};
