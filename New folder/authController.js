const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Platform = require("../models/Platform");
const ActivityLog = require("../models/ActivityLog");
const { sendOTP } = require("../utils/emailSender");

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).send("Email already registered");

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });
  await user.save();

  // Send OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.create({ user_id: user._id, otp: otpCode });
  await sendOTP(email, otpCode);

  res.send("Registration successful. OTP sent to email.");
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  const record = await OTP.findOne({ user_id: user._id, otp }).sort({ createdAt: -1 });
  if (!record) return res.status(400).send("Invalid OTP");

  await ActivityLog.create({
    user_id: user._id,
    action: "OTP Verified",
    platform: "N/A",
    details: "User verified OTP"
  });

  res.send("OTP verified. Access dashboard");
});

module.exports = router;
