const mongoose = require('mongoose')

const ChatMessageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
})

module.exports = mongoose.model('chatMessage', ChatMessageSchema)
