const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Post title is required"],
    minlength: [3, "Title must be at least 3 characters"],
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  image: {
    type: String,
    required: [true, "Image URL is required"],
    match: [/^https?:\/\/.+/, "Image must be a valid URL"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    minlength: [10, "Description must be at least 10 characters"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pinterest_user",
    required: [true, "User reference is required"]
  }
});

module.exports = mongoose.model("post", postSchema);
