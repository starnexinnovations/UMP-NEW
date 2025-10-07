const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  platform_name: { type: String, required: true },
  sender_name: { type: String },
  content: { type: String },
  message_type: { type: String, enum: ["text", "image", "video", "audio"], default: "text" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
