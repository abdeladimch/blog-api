const Comment = require("../models/Comment");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const checkPerms = require("../utils/checkPerms");
const Post = require("../models/Post");

const createComment = async (req, res) => {
  const { commentContent } = req.body;
  const { id } = req.params;
  const post = await Post.findOne({ _id: id });
  if (!post) {
    throw new CustomError.NotFoundError(
      `Couldn't find blog post with id ${id}`
    );
  }
  if (!commentContent) {
    throw new CustomError.BadRequestError("Comment content cannot be empty!");
  }

  req.body.user = req.user.userId;
  req.body.post = id;
  const comment = await Comment.create(req.body);
  res.status(StatusCodes.CREATED).json({ status: "Success!", comment });
};

const getAllComments = async (req, res) => {
  const comments = await Comment.find()
    .populate({
      path: "post",
      select: "title _id",
    })
    .populate({ path: "user", select: "name _id" });
  if (!comments) {
    throw new CustomError.NotFoundError("No comments found!");
  }
  res
    .status(StatusCodes.OK)
    .json({ Status: "Success!", comments, count: comments.length });
};

const getSingleComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findOne({ _id: id })
    .populate({
      path: "post",
      select: "title _id",
    })
    .populate({ path: "user", select: "name _id" });
  if (!comment) {
    throw new CustomError.NotFoundError(`Couldn't find comment with id ${id}`);
  }
  checkPerms(req.user, comment.user);
  res.status(StatusCodes.OK).json({ status: "Success!", comment });
};

const updateComment = async (req, res) => {
  const { id } = req.params;
  const { commentContent } = req.body;

  if (!commentContent) {
    throw new CustomError.BadRequestError("Comment content cannot be empty!");
  }

  const comment = await Comment.findOne({ _id: id });
  if (!comment) {
    throw new CustomError.NotFoundError(`Couldn't find comment with id ${id}`);
  }
  checkPerms(req.user, comment.user);
  comment.content = content;
  await comment.save();
  res.status(StatusCodes.OK).json({ status: "Success!", comment });
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findOne({ _id: id });

  if (!comment) {
    throw new CustomError.NotFoundError(`Couldn't find comment with id ${id}`);
  }

  checkPerms(req.user, comment.user);
  await comment.remove();

  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Comment removed!" });
};

const showMyComments = async (req, res) => {
  const myComments = await Comment.find({ user: req.user.userId }).populate({
    path: "post",
    select: "title",
  });
  if (!myComments.length) {
    throw new CustomError.NotFoundError("You don't have any comments yet!");
  }
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", myComments, count: myComments.length });
};

const showPostComments = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (!post) {
    throw new CustomError.NotFoundError(
      `Couldn't find blog post with id ${req.params.id}`
    );
  }
  const postComments = await Comment.find({ post: req.params.id });
  if (!postComments.length) {
    throw new CustomError.NotFoundError(
      "No comments found for this blog post!"
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ status: "Success", postComments, count: postComments.length });
};

module.exports = {
  createComment,
  getAllComments,
  getSingleComment,
  updateComment,
  deleteComment,
  showMyComments,
  showPostComments,
};
