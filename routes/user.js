const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  showMe,
  updateUser,
  updateUserPassword,
  deleteUser,
} = require("../controllers/user");

const { showMyComments } = require("../controllers/comment");

const { showMyPosts } = require("../controllers/post");

const { authUser, authPerms } = require("../middlewares/authMiddleware");

router.route("/").get(authUser, authPerms("admin"), getAllUsers);
router.route("/showMe").get(authUser, showMe);
router.route("/showMyPosts").get(authUser, showMyPosts);
router.route("/showMyComments").get(authUser, showMyComments);
router.route("/:id").get(authUser, getSingleUser);

router.route("/updateUser").patch(authUser, updateUser);
router.route("/updateUserPassword").patch(authUser, updateUserPassword);
router.route("/:id").delete(authUser, deleteUser);

module.exports = router;
