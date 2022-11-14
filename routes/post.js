const express = require("express");
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
} = require("../controllers/post");

const { showPostComments } = require("../controllers/comment");
const { authUser, authPerms } = require("../middlewares/authMiddleware");

router
  .route("/")
  .post(authUser, authPerms("admin"), createPost)
  .get(authUser, authPerms("admin"), getAllPosts);

router.route("/:id/showPostComments").get(authUser, showPostComments);

router
  .route("/:id")
  .get(authUser, getSinglePost)
  .patch(authUser, updatePost)
  .delete(authUser, deletePost);


module.exports = router;
