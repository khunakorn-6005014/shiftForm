const Comment = require('../models/comment.js');

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

module.exports = { createComment };
