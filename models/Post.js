const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: [50, "Title cannot be more than 50 characters long!"],
      trim: true,
    },
    article: {
      type: String,
      trim: true,
      required: true,
      maxlength: [500, "Article cannot be more than 1000 characters long!"],
    },
    image: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

PostSchema.pre("remove", async function (next) {
  await this.model("Comment").deleteMany({ post: this._id });
  next();
});

module.exports = mongoose.model("Post", PostSchema);
