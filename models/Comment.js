const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    commentContent: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Post comment cannot be more than 200 characters long!"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
