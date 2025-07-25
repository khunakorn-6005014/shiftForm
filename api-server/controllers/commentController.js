const Comment = require('../models/comment.js');
const { isAdmin } = require('../utils/auth.js');

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!isAdmin({ user: currentUser })) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({ message: 'Comment deleted successfully', comment: deletedComment });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCommentById = async (req, res) => {
  try {
    const { _id, comment } = req.body;

    if (!_id || !comment || !comment.description) {
      return res.status(400).json({ error: 'Missing required fields: _id or comment.description' });
    }

    const updated = await Comment.findByIdAndUpdate(
      _id,
      {
        description: comment.description,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update comment', details: err.message });
  }
};

// Get All User's comments
exports.getAllUserComments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const comments = await Comment.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user comments', details: err.message });
  }
};

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
