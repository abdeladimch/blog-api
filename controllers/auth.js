const CustomError = require("../errors");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const Token = require("../models/Token");
const jwt = require("../utils");

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new CustomError.BadRequestError(
      "Name, email and password fields cannot be empty!"
    );
  }
  const emailToken = crypto.randomBytes(64).toString("hex");
  req.body.emailToken = emailToken;
  const origin = req.headers.host;
  const user = await User.create(req.body);
  await sendEmail(user.name, user.email, emailToken, origin);
  res
    .status(StatusCodes.CREATED)
    .json({ status: "Success!", msg: "Please verify your email!" });
};

const verifyEmail = async (req, res) => {
  const user = await User.findOne({ emailToken: req.query.token });

  user.isVerified = true;
  user.emailToken = "";
  user.verified = Date.now();
  await user.save(); //to update user info
  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "Email verified!" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Email and password fields cannot be empty!"
    );
  }

  const user = await User.findOne({ email });
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email!");
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new CustomError.UnauthenticatedError("Invalid credentials!");
  }

  const userToken = jwt.createToken(user);
  let refreshToken = "";

  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    refreshToken = existingToken.refreshToken;
    jwt.attachCookiesToRes(res, userToken, refreshToken);
    return res
      .status(StatusCodes.OK)
      .json({ status: "Success!", user: userToken });
  }

  refreshToken = crypto.randomBytes(64).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  await Token.create({ userAgent, refreshToken, ip, user: user._id });
  jwt.attachCookiesToRes(res, userToken, refreshToken);
  res.status(StatusCodes.OK).json({ status: "Success!", user: userToken });
};

const logout = async (req, res) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res
    .status(StatusCodes.OK)
    .json({ status: "Success!", msg: "User logged out!" });
};

module.exports = { signup, login, verifyEmail, logout };
