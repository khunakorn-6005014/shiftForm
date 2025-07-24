const Comment = require('../models/comment.js');
const { isAdmin } = require('../utils/auth.js');

// Get All Comments ( for admin )
exports.getAllComments = async (req, res) => {
  try {
    if (!isAdmin({user:req.user})) {
      return res.status(403).json({ message: 'Access denied: Admins only.' });
    }

    const comments = await Comment.find({});
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Comment by Id
exports.getCommentById = async (req, res) => {
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
exports.createComment = async (req, res) => {
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
