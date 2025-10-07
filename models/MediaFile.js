const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  message_id: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  file_url: { type: String },
  media_type: { type: String }, // image, video, audio
  downloaded: { type: Boolean, default: false },
  shared: { type: Boolean, default: false }
});

module.exports = mongoose.model("MediaFile", mediaSchema);
