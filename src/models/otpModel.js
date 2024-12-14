const {otpContainer} = require("../utils/db");

const generateAndStoreOTP = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const expiresAt = new Date(Date.now() +  10 * 60 * 1000).toISOString(); // 10m from now

    const otpRecord = {
      email,
      otp,
      expiresAt,
      used: false,
    };

    await otpContainer.items.create(otpRecord);
    return otpRecord;
  };
const getOtp = async (email, otp) => {
    
    const query = {
      query: "SELECT * FROM c WHERE c.email = @email and c.otp = @otp",
      parameters: [{ name: "@email", value: email }, { name: "@otp", value: otp }],
    };
  
    const { resources } = await otpContainer.items.query(query).fetchAll();
    return resources;
  };
const markOtpUsed = async (otpRecord) => {

    await otpContainer.items.upsert(otpRecord);
    return otpRecord;

    };
  

  module.exports = { generateAndStoreOTP, markOtpUsed, getOtp };

