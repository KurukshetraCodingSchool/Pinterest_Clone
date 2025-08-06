const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [20, "Username cannot exceed 20 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email"]
  },
  Dob: {
    type: Date,
    required: [true, "Date of Birth is required"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Automatically handles username, hash, salt, password logic
userSchema.plugin(plm, { usernameField: "email" });

module.exports = mongoose.model("pinterest_user", userSchema);
