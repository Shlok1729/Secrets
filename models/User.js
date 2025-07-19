const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  secrets: [String] // New field to store multiple secrets
});

module.exports = mongoose.model('User', userSchema);
