const express = require("express");
const router = express.Router();
const axios = require("axios");
const Message = require("../models/Message");
const Platform = require("../models/Platform");

// Fetch messages
router.post("/fetch", async (req, res) => {
  const { user_id, platforms } = req.body;
  let inbox = {};

  for (let name of platforms) {
    const platform = await Platform.findOne({ user_id, platform_name: name });
    if (!platform || !platform.access_token) continue;

    let messagesData;
    if (name === "whatsapp")
      messagesData = await axios.get(`https://graph.facebook.com/v16.0/me/messages?access_token=${platform.access_token}`);
    if (name === "telegram")
      messagesData = await axios.get(`https://api.telegram.org/bot${platform.access_token}/getUpdates`);
    if (name === "instagram")
      messagesData = await axios.get(`https://graph.instagram.com/me/messages?access_token=${platform.access_token}`);
    if (name === "facebook")
      messagesData = await axios.get(`https://graph.facebook.com/me/messages?access_token=${platform.access_token}`);

    inbox[name] = messagesData.data;

    // Save in DB
    for (let msg of inbox[name].data || []) {
      await Message.create({
        user_id,
        platform_name: name,
        sender_name: msg.from || msg.sender_name,
        content: msg.message || msg.text,
        message_type: msg.type || "text",
        timestamp: new Date(msg.timestamp || Date.now())
      });
    }
  }

  res.json(inbox);
});

module.exports = router;
