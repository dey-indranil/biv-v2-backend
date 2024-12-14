require("dotenv").config();
const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service provider
    auth: {
      user: process.env.EMAIL_USER, // Your email address (use environment variable for security)
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

module.exports = {emailTransporter};