const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server)

const port = 3000

// Mongoose
const ChatMessageModel = require('./models/chatMessageModel')

const connectionMongoDB = require('./connectionMongoDB')
connectionMongoDB()

app.use(express.static('public'))

// Endpoint to show message in mongoDB
app.get('/messages', async (req, res) => {
  try {
    const allMessages = await ChatMessageModel.find()
    return res.status(200).json(allMessages)
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    })
  }
})

//clock
setInterval(() => {
  const today = new Date()
  const time = today.toLocaleString() // Get the current date and time in a localized format

  io.emit('time', time) // Emitting the time as before
}, 1000)

io.on('connection', (socket) => {
  console.log(`A client with id ${socket.id} connected to the chat!`)

  socket.on('chatMessage', (msg) => {
    console.log('Message: ' + msg.user + ' ' + msg.message + msg.time)
    io.emit('newChatMessage', {
      user: msg.user,
      message: msg.message,
      date: new Date(),
    })
    let today = new Date()
    let dateTime = today.toLocaleString()
    let user = msg.user
    let message = msg.message
    // Sparar till MongoDB med Mongoose
    const newMessage = new ChatMessageModel({
      message: message,
      user: user,
      date: dateTime,
    })
    newMessage.save()
  })
  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected!`)
  })
})

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`)
})
