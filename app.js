require("express-async-errors");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 2000;

const fileUpload = require("express-fileupload");
const { uploadImage } = require("./controllers/post");

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const { authUser, authPerms } = require("./middlewares/authMiddleware");

const connectDB = require("./db/connect");

app.set("trust proxy", 1);

app.use(
  rateLimiter({
    windowMs: 1000 * 60 * 15,
    max: 50,
  })
);

app.use(cors());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(express.static("./public"));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.post("/api/uploadImage", authUser, authPerms("admin"), uploadImage);

app.use(errorHandler);
app.use(notFound);

connectDB(process.env.MONGO_URI);

mongoose.connection.once("open", () => {
  console.log("Connected to DB");
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
  });
});
