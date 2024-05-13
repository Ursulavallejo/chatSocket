const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server)

const port = 3000

app.use(express.static('public'))

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
  })
  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected!`)
  })
})

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`)
})
