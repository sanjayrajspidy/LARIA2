// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  branch: { type: String, required: true },  // NEW
  year: { type: String, required: true },    // NEW
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
