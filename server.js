require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const User = require("./models/User");
const Message = require("./models/Message");
const Platform = require("./models/Platform");
const { sendVerificationEmail, sendOTP } = require("./utils/emailSender");
const { sendWhatsAppMessage, parseWhatsAppWebhook, verifyWhatsAppWebhook } = require("./utils/whatsappIntegration");
const { sendTelegramMessage, parseTelegramWebhook } = require("./utils/telegramIntegration");
const { sendFacebookMessage, parseFacebookWebhook, verifyFacebookWebhook } = require("./utils/facebookIntegration");
const { sendInstagramMessage, parseInstagramWebhook, verifyInstagramWebhook } = require("./utils/instagramIntegration");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connect mongodb://localhost:27017/
mongoose.connect("mongodb://localhost:27017/ump_project", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Register with Email Verification
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verification_token: verificationToken,
      verification_token_expires: tokenExpires
    });
    await newUser.save();

    await sendVerificationEmail(email, verificationToken, username);

    res.send("Registration Successful! Please check your email to verify your account.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
});

// Verify Email
app.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      verification_token: token,
      verification_token_expires: { $gt: Date.now() }
    });

    if (!user) {
      return res.send("<h2>Invalid or expired verification link</h2>");
    }

    user.email_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();

    res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            h2 { color: #4CAF50; }
            a { color: #2196F3; text-decoration: none; }
          </style>
        </head>
        <body>
          <h2>✅ Email Verified Successfully!</h2>
          <p>Your account has been verified. You can now login.</p>
          <a href="/login.html">Go to Login</a>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login with Email Verification Check
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    if (!user.email_verified) {
      return res.status(400).send("Please verify your email before logging in");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("Invalid password");

    user.last_login = new Date();
    await user.save();

    res.json({ message: "Login Successful", userId: user._id, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.send("Password changed successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Send OTP for Password Reset
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otp_expires = otpExpires;
    await user.save();

    await sendOTP(email, otp);

    res.send("OTP sent to your email");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Verify OTP and Reset Password
app.post("/verify-otp-reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otp_expires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).send("Invalid or expired OTP");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otp_expires = null;
    await user.save();

    res.send("Password reset successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// WhatsApp Webhook Verification
app.get("/webhook/whatsapp", async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const result = await verifyWhatsAppWebhook(mode, token, challenge);
  if (result) {
    res.status(200).send(result);
  } else {
    res.sendStatus(403);
  }
});

// WhatsApp Webhook Handler
app.post("/webhook/whatsapp", async (req, res) => {
  try {
    const messageData = parseWhatsAppWebhook(req.body);
    if (messageData) {
      const newMessage = new Message({
        user_id: req.body.userId || null,
        platform_name: "WhatsApp",
        sender_name: messageData.senderName,
        content: messageData.text,
        message_type: messageData.type,
        timestamp: messageData.timestamp
      });
      await newMessage.save();
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Telegram Webhook Handler
app.post("/webhook/telegram", async (req, res) => {
  try {
    const messageData = parseTelegramWebhook(req.body);
    if (messageData) {
      const newMessage = new Message({
        user_id: req.body.userId || null,
        platform_name: "Telegram",
        sender_name: messageData.senderName,
        content: messageData.text,
        message_type: messageData.type,
        timestamp: messageData.timestamp
      });
      await newMessage.save();
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Facebook Webhook Verification
app.get("/webhook/facebook", async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const result = await verifyFacebookWebhook(mode, token, challenge);
  if (result) {
    res.status(200).send(result);
  } else {
    res.sendStatus(403);
  }
});

// Facebook Webhook Handler
app.post("/webhook/facebook", async (req, res) => {
  try {
    const messageData = parseFacebookWebhook(req.body);
    if (messageData) {
      const newMessage = new Message({
        user_id: req.body.userId || null,
        platform_name: "Facebook",
        sender_name: messageData.senderId,
        content: messageData.text,
        message_type: messageData.type,
        timestamp: messageData.timestamp
      });
      await newMessage.save();
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Instagram Webhook Verification
app.get("/webhook/instagram", async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const result = await verifyInstagramWebhook(mode, token, challenge);
  if (result) {
    res.status(200).send(result);
  } else {
    res.sendStatus(403);
  }
});

// Instagram Webhook Handler
app.post("/webhook/instagram", async (req, res) => {
  try {
    const messageData = parseInstagramWebhook(req.body);
    if (messageData) {
      const newMessage = new Message({
        user_id: req.body.userId || null,
        platform_name: "Instagram",
        sender_name: messageData.senderId,
        content: messageData.text,
        message_type: messageData.type,
        timestamp: messageData.timestamp
      });
      await newMessage.save();
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Get Messages
app.get("/api/messages/:userId", async (req, res) => {
  try {
    const messages = await Message.find({ user_id: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching messages");
  }
});

// Connect Platform
app.post("/api/connect-platform", async (req, res) => {
  try {
    const { userId, platformName, accessToken } = req.body;

    const newPlatform = new Platform({
      user_id: userId,
      platform_name: platformName,
      access_token: accessToken
    });
    await newPlatform.save();

    res.send("Platform connected successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting platform");
  }
});

// Send WhatsApp Message
app.post("/api/send/whatsapp", async (req, res) => {
  try {
    const { to, message, userId } = req.body;

    const result = await sendWhatsAppMessage(to, message);

    const newMessage = new Message({
      user_id: userId,
      platform_name: "WhatsApp",
      sender_name: "You",
      content: message,
      message_type: "text",
      timestamp: new Date()
    });
    await newMessage.save();

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("WhatsApp send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send Telegram Message
app.post("/api/send/telegram", async (req, res) => {
  try {
    const { chatId, message, userId } = req.body;

    const result = await sendTelegramMessage(chatId, message);

    const newMessage = new Message({
      user_id: userId,
      platform_name: "Telegram",
      sender_name: "You",
      content: message,
      message_type: "text",
      timestamp: new Date()
    });
    await newMessage.save();

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Telegram send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send Facebook Message
app.post("/api/send/facebook", async (req, res) => {
  try {
    const { recipientId, message, userId } = req.body;

    const result = await sendFacebookMessage(recipientId, message);

    const newMessage = new Message({
      user_id: userId,
      platform_name: "Facebook",
      sender_name: "You",
      content: message,
      message_type: "text",
      timestamp: new Date()
    });
    await newMessage.save();

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Facebook send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send Instagram Message
app.post("/api/send/instagram", async (req, res) => {
  try {
    const { recipientId, message, userId } = req.body;

    const result = await sendInstagramMessage(recipientId, message);

    const newMessage = new Message({
      user_id: userId,
      platform_name: "Instagram",
      sender_name: "You",
      content: message,
      message_type: "text",
      timestamp: new Date()
    });
    await newMessage.save();

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Instagram send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
