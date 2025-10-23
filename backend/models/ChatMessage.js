const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user','agent'], default: 'user' },
  name: { type: String },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
