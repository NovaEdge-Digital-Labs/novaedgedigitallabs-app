const express = require('express');
const router = express.Router();
const {
    createPost,
    getFeed,
    likePost,
    updatePost,
    deletePost,
    addComment,
    sharePost,
    getUserPosts
} = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all routes for posts
router.use(protect);

router.get('/user/me', getUserPosts);
router.get('/', getFeed);
router.post('/', createPost);
router.post('/:id/like', likePost);
router.post('/:id/comment', addComment);
router.post('/:id/share', sharePost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

module.exports = router;
