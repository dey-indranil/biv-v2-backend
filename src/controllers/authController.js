const { createUser, findUserByEmail, updateUserVerification } = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");

let users = [];
let otps = {};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    //console.log(email, password);
    if (!email || !password ) return res.status(400).send("All fields are required");
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).send("User already exists");

      // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps[email] = otp;

    // Send OTP via email (simulate with console.log for now)
    console.log(`OTP for ${email}: ${otp}`);

    // Save user data temporarily
    users.push({ email, password, verified: false });
    //console.log(users);
      const newUser = await createUser({ email, password, verified: false });
      console.log(newUser);
      res.status(201).json({ email: newUser.email, message: 'OTP sent to email. Please verify.'  });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
;

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  console.log(email,otp);
  if (otps[email] !== otp) {
    return res.status(400).json({ message: 'Invalid OTP.' });
  }

  // Mark user as verified
  try{
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

  // Delete OTP
  delete otps[email];
  res.json({ message: 'Email verified successfully!' });
  
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

module.exports = { register, login, verifyEmail };
