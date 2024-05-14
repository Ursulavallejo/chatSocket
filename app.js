const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server)

const port = 3000

// Mongoose
const ChatMessageModel = require('./models/chatMessageModel')
const GameMessageModel = require('./models/gameMessageModel')

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

app.get('/dice-game', async (req, res) => {
  try {
    const allMessages = await GameMessageModel.find()
    return res.status(200).json(allMessages)
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    })
  }
})

// Emit time every second/clock
setInterval(() => {
  const today = new Date()
  const time = today.toLocaleString() // Get the current date and time in a localized format

  io.emit('time', time) // Emitting the time as before
}, 1000)

// Object to store user colors
const userColors = {}
const predefinedColors = ['#07847e', '#7549a7', '#99ceb4', '#c3af58', '#e4a9ef']
let colorIndex = 0

const userTotals = {}

io.on('connection', (socket) => {
  // Generate a random color for the user
  // const userColor = getRandomColor()

  // Select a color from the predefined array
  const userColor = predefinedColors[colorIndex]

  // Store the user color based on their socket ID
  userColors[socket.id] = userColor

  console.log(`A client with id ${socket.id} connected to the chat!`)

  // Increment the color index for the next user
  colorIndex = (colorIndex + 1) % predefinedColors.length

  socket.on('chatMessage', (msg) => {
    console.log('Message: ' + msg.user + ' ' + msg.message)

    io.emit('newChatMessage', {
      user: msg.user,
      message: msg.message,
      date: new Date(),
      color: userColors[socket.id], // Send the user color with the message
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

  socket.on('gameMessage', async (msg) => {
    if (!msg.user) {
      // If the user is not authenticated, send an error message
      socket.emit('errorMessage', {
        message: 'To play, you need to be logged in.',
      })
    } else {
      // If the user is authenticated, continue with the game logic
      // Generate a random number between 1 and 6 for the dice roll
      const diceRoll = Math.floor(Math.random() * 6) + 1

      // Calculate the total sum of all dice rolls
      const total = (msg.total || 0) + diceRoll

      // Update total user
      userTotals[msg.user] = total

      console.log(
        'Message: ' +
          msg.user +
          ' , DiceRol: ' +
          diceRoll +
          ' , Total: ' +
          total
      )

      //verify user has recahed 21 points
      // if (total >= 21) {
      //   io.emit('gameWinner', { winner: msg.user, total: total })
      //   Object.keys(userTotals).forEach((user) => {
      //     userTotals[user] = 0
      //   })
      //   io.emit('gameRestarted')
      // }
      if (total === 21) {
        // If the total is exactly 21, declare the winner
        io.emit('gameWinner', { winner: msg.user, total: total })
      } else if (total > 21) {
        // If the total exceeds 21, the player loses but the game continues
        io.emit('gameLoser', { loser: msg.user, total: total })
        userTotals[msg.user] = 0 // Reset the total to 0 for the losing player
      }

      //GAME
      else
        io.emit('newGameMessage', {
          user: msg.user,
          date: new Date(),
          diceResult: diceRoll,
          total: total,
          color: userColors[socket.id],
        })

      let today = new Date()
      let dateTime = today.toLocaleString()
      let user = msg.user
      let diceResult = diceRoll
      let sum = total

      // Sparar till MongoDB med Mongoose
      const newGameMessage = new GameMessageModel({
        user: user,
        date: dateTime,
        total: sum,
        diceResult: diceResult,
      })
      newGameMessage.save()
    }
  })

  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected!`)
    // Remove the user color when the user disconnects
    delete userColors[socket.id]
  })
})

// Function to generate a random color
// function getRandomColor() {
//   const letters = '0123456789ABCDEF'
//   let color = '#'
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)]
//   }
//   return color
// }

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`)
})
