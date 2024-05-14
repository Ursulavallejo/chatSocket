const mongoose = require('mongoose')

const GameMessageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  diceResult: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
})

module.exports = mongoose.model('gameMessage', GameMessageSchema)
