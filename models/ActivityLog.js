const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String },  // login, reply, download
  platform: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ActivityLog", logSchema);
