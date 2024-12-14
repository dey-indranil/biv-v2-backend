const express = require("express");
const { register, login, verifyEmail, generateOTP, validateOTP } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/generate-otp", generateOTP);
router.post("/validate-otp", validateOTP);

module.exports = router;
