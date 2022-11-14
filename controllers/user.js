const User = require("../models/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const checkPerms = require("../utils/checkPerms.js");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  if (!users) {
    throw new CustomError.NotFoundError("No users found");
  }
  res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(
      `Coudn't find user with id ${req.params.id}`
    );
  }
  checkPerms(req.user, user._id);
  res.status(StatusCodes.OK).json(user);
};

const showMe = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select("-password");
  res.status(StatusCodes.OK).json(user);
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError(
      "Name and email fields cannot be empty!"
    );
  }
  const user = await User.findOne({ _id: req.user.userId }).select("-password");
  checkPerms(req.user, user._id);
  user.role = req.user.role;
  user.name = name;
  user.email = email;
  await user.save();
  res.status(StatusCodes.OK).json(user);
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide old and new password!"
    );
  }
  const user = await User.findOne({ _id: req.user.userId });
  checkPerms(req.user, user._id);
  if (user && (await bcrypt.compare(oldPassword, user.password))) {
    user.password = newPassword;
    await user.save();
    return res
      .status(StatusCodes.OK)
      .json({ status: "Success!", msg: "Password updated!" });
  }
  throw new CustomError.UnauthenticatedError("Invalid credentials!");
};

const deleteUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    throw new CustomError.NotFoundError(
      `Coudn't find user with id ${req.params.id}`
    );
  }
  checkPerms(req.user, user._id);
  await user.remove();
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Account deleted!" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showMe,
  updateUser,
  updateUserPassword,
  deleteUser,
};
