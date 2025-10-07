const mongoose = require("mongoose");

const platformSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  platform_name: { type: String, required: true },
  access_token: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  synced_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Platform", platformSchema);
