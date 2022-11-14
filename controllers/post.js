const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Post = require("../models/Post");
const checkPerms = require("../utils/checkPerms");
const path = require("path");

const createPost = async (req, res) => {
  const { title, article, image } = req.body;
  if (!title || !article || !image) {
    throw new CustomError.BadRequestError(
      "Title, article and image fields cannot be empty!"
    );
  }
  req.body.user = req.user.userId;
  const post = await Post.create(req.body);
  res.status(StatusCodes.CREATED).json({ status: "Success!", post });
};

const getAllPosts = async (req, res) => {
  const posts = await Post.find();
  if (!posts.length) {
    throw new CustomError.NotFoundError("No blog posts found!");
  }
  res
    .status(StatusCodes.OK)
    .json({ Status: "Success!", posts, count: posts.length });
};

const getSinglePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOne({ _id: id });
  if (!post) {
    throw new CustomError.NotFoundError(
      `Couldn't find blog post with id ${id}`
    );
  }
  checkPerms(req.user, post.user);
  res.status(StatusCodes.OK).json({ status: "Success!", post });
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, article, image } = req.body;

  if (!title || !article || !image) {
    throw new CustomError.BadRequestError(
      "Title, article and image fields cannot be empty!"
    );
  }

  const post = await Post.findOne({ _id: id });
  if (!post) {
    throw new CustomError.NotFoundError(
      `Couldn't find blog post with id ${id}`
    );
  }
  checkPerms(req.user, post.user);
  post.title = title;
  post.image = image;
  post.article = article;
  await post.save();
  res.status(StatusCodes.OK).json({ status: "Success!", post });
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOne({ _id: id });

  if (!post) {
    throw new CustomError.NotFoundError(
      `Couldn't find blog post with id ${id}`
    );
  }

  checkPerms(req.user, post.user);
  await post.remove();

  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Blog post removed!" });
};

const showMyPosts = async (req, res) => {
  const myPosts = await Post.find({ user: req.user.userId });
  if (!myPosts.length) {
    throw new CustomError.NotFoundError("You don't have any blog posts yet!");
  }
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", myPosts, count: myPosts.length });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No file uploaded!");
  }

  const postImage = req.files.image;

  if (!postImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload image!");
  }

  const maxSize = 1024 * 5120;

  if (postImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Image size cannot be more than 5MB!"
    );
  }

  const imagePath = path.join(__dirname, `../public/uploads/${postImage.name}`);

  await postImage.mv(imagePath);
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Image uploaded successfully!" });
};

module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  showMyPosts,
  updatePost,
  deletePost,
  uploadImage,
};
