const express = require("express");
const router = express.Router();

const {
  createComment,
  getAllComments,
  getSingleComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment");

const { authUser, authPerms } = require("../middlewares/authMiddleware");

router.route("/").get(authUser, authPerms("admin"), getAllComments);
router.route("/:id").post(authUser, authPerms("admin"), createComment);

router
  .route("/:id")
  .get(authUser, getSingleComment)
  .patch(authUser, updateComment)
  .delete(authUser, deleteComment);

module.exports = router;
