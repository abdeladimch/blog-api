const express = require("express");
const router = express.Router();

const { signup, login, verifyEmail, logout } = require("../controllers/auth");

router.post("/signup", signup);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
