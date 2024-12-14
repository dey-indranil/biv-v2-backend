const { createUser, findUserByEmail, updateUserVerification } = require("../models/userModel");
const { generateAndStoreOTP, markOtpUsed, getOtp } = require("../models/otpModel");
const { generateToken } = require("../utils/jwt");
const { emailTransporter } = require("../utils/emailer");
const bcrypt = require("bcryptjs");

const express = require("express");

const router = express.Router();

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Generate OTP
    const otpRecord = await generateAndStoreOTP(email);
    const otp = otpRecord.otp; // Assuming OTP is part of the returned record

    // Create the user
    const newUser = await createUser({ email, password, verified: false });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Receiver's email
      subject: 'Your OTP for Verification',
      text: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`,
    };

    await emailTransporter.sendMail(mailOptions);

    res.status(201).json({ email: newUser.email, message: 'OTP sent to email. Please verify.' });
  } catch (error) {
    console.error("Error in register:", error.message);
    res.status(500).send(error.message);
  }
};


const validateOtpLogic = async (email, otp) => {
  if (!email || !otp) return { status: 400, message: "Email and OTP are required" };

  const resources = await getOtp(email, otp);
  if (!resources) return { status: 400, message: "OTP not found" };
  const otpRecord = resources[0];

  if (!otpRecord) return { status: 400, message: "Invalid OTP" };

  // Check if OTP is expired or already used
  if (new Date() > new Date(otpRecord.expiresAt))
    return { status: 400, message: "OTP has expired" };
  if (otpRecord.used) return { status: 400, message: "OTP has already been used" };

  // Mark OTP as used
  otpRecord.used = true;
  await markOtpUsed(otpRecord);

  return { status: 200, message: "OTP validated successfully" };
};

const validateOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await validateOtpLogic(email, otp);
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Error validating OTP:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  console.log(email, otp);

  try {
    const otpValidationResult = await validateOtpLogic(email, otp);
    if (otpValidationResult.status !== 200) {
      return res.status(otpValidationResult.status).json({ message: otpValidationResult.message });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).send("User not found");

    user.verified = true;
    const updatedUser = await updateUserVerification(user);
    console.log(updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ email: updatedUser.email, message: 'User verified successfully.' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("All fields are required");

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).send("User not found");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).send("Invalid credentials");

    const token = generateToken(user.id);
    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const generateOTP = async (req, res) =>{
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    //TODO
    const otpRecord = await generateAndStoreOTP(email);
    if (!otpRecord) return res.status(404).send("Problem generating OTP. Please retry.");

    // Send OTP to user (via email/SMS)
    console.log(`Generated OTP for ${email}: ${otp}`);

    res.status(200).json({ message: "OTP generated successfully" });
  } catch (error) {
    console.error("Error generating OTP:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { register, login, verifyEmail, generateOTP, validateOTP };
