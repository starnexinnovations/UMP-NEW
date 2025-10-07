const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true }, // Auto increment
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: null }
});

// Auto increment plugin
userSchema.plugin(AutoIncrement, { inc_field: "user_id" });

const User = mongoose.model("User", userSchema);

module.exports = User;
