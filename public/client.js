const socket = io()
import fetchAndDisplayMessages, {
  createNode,
  append,
} from './js/fetch-message.js'

//CHAT
const formUser = document.querySelector('#formUser')
const inputUser = document.querySelector('#inputUser')
const messages = document.querySelector('#messages')
const formChatMessage = document.querySelector('#formChatMessage')
// const input = document.querySelector('#inputChatMessage')
const userContainer = document.querySelector('#userContainer')
const clock = document.querySelector('#clock')
const buttonShowChatHistoric = document.querySelector('#button-view-data')
const buttonHideChatHistoric = document.querySelector('#button-hide-data')

//GAME
const rollDiceButton = document.querySelector('#roll')
const buttonContainer = document.querySelector('#button-game')

// Disable the roll dice button initially
// rollDiceButton.disabled = true

const diceContainer = document.querySelector('.dice-container')
const endGameMessage = document.querySelector('#endGameMessage')

let myUser = null
const userTotals = {}

// CHAT
formUser.addEventListener('submit', function (e) {
  e.preventDefault()
  // myUser = inputUser.value
  const username = inputUser.value.trim()

  if (!username) {
    document.getElementById('usernameError').style.display = 'block'
    // alert('Please provide a username.')
    return
  } else {
    document.getElementById('usernameError').style.display = 'none'
  }

  myUser = username

  //photo selection based on the gender
  const gender = document.getElementById('genderSelect').value
  // generate a random number between 1 and 50 to change the photo is provide by the api
  const randomNumber = Math.floor(Math.random() * 50) + 1

  // Create elements for user information
  const topDiv = createNode('div')
  topDiv.classList.add('top')

  const userDiv = createNode('div')
  userDiv.classList.add('user-info')

  const img = createNode('img')
  img.src = `https://randomuser.me/api/portraits/${gender}/${randomNumber}.jpg`
  img.alt = `${myUser}`

  const userStatusDiv = createNode('div')
  userStatusDiv.id = 'user-status'

  const strong = createNode('strong')
  strong.textContent = myUser

  const statusDiv = createNode('div')
  statusDiv.classList.add('status')
  statusDiv.textContent = 'Online'

  append(userDiv, img)
  append(topDiv, userDiv)
  append(userStatusDiv, strong)
  append(userStatusDiv, statusDiv)
  append(topDiv, userStatusDiv)
  append(userContainer, topDiv)

  document.querySelector('#user').style.display = 'none'
  document.querySelector('#chat-message').style.display = 'block'

  // Enable the roll dice button after user logs in
  rollDiceButton.disabled = false
})

formChatMessage.addEventListener('submit', function (e) {
  e.preventDefault()
  if (inputChatMessage.value) {
    socket.emit('chatMessage', {
      user: myUser,
      message: inputChatMessage.value,
      date: new Date(),
    })
    inputChatMessage.value = ''
  }
})

socket.on('time', (timeMsg) => {
  clock.innerHTML = timeMsg
})

// show the messages that have been send by users are connected
socket.on('newChatMessage', function (msg) {
  let item = document.createElement('li')
  const formattedDate = new Date(msg.date).toLocaleString()

  item.classList.add('message')

  if (msg.user === myUser) {
    item.classList.add('you')
  }

  // Add a unique class to the message element based on the user who posted it
  item.classList.add('message-' + msg.user.toLowerCase())

  // Apply a random background color to the message
  item.style.backgroundColor = msg.color

  // item.textContent = msg.user + ': ' + msg.message + ' (' + formattedDate + ')'
  item.textContent = msg.user + ': ' + msg.message

  let dateSpan = document.createElement('span')
  dateSpan.textContent = formattedDate
  dateSpan.classList.add('date')

  item.appendChild(dateSpan)

  messages.appendChild(item)
})

// Historic Data CHAT

buttonShowChatHistoric.addEventListener('click', function (e) {
  e.preventDefault()
  fetchAndDisplayMessages()
  document.querySelector('.messages').style.display = 'none'
  document.querySelector('#formChatMessage').style.display = 'none'
  document.querySelector('#chat-historic').style.display = 'block'
})

buttonHideChatHistoric.addEventListener('click', function (e) {
  e.preventDefault()
  document.querySelector('.messages').style.display = 'block'
  document.querySelector('#formChatMessage').style.display = 'flex'
  document.querySelector('#chat-historic').style.display = 'none'
})

// GAME

// GAME

// function handleRollDiceButtonClick() {
//   if (!myUser) {
//     // If not logged in, display an error message on the DOM
//     const errorMessage = document.createElement('p')
//     errorMessage.textContent = 'To play, you need to be logged in.'
//     errorMessage.classList.add('error-message')
//     buttonContainer.appendChild(errorMessage)

//     setTimeout(() => {
//       errorMessage.remove()
//     }, 3000)
//   } else {
//     // Send game message with user's total
//     socket.emit('gameMessage', {
//       user: myUser,
//       total: userTotals[myUser], // Pass the current user total to the server
//     })
//   }
// }

// Add event listener to the roll dice button
// rollDiceButton.addEventListener('click', handleRollDiceButtonClick)

rollDiceButton.addEventListener('click', function () {
  // Emit a "gameMessage" event to the server
  socket.emit('gameMessage', {
    user: myUser,
    total: userTotals[myUser],
  })
})

socket.on('newGameMessage', function (msg) {
  // Format the date
  const formattedDate = new Date(msg.date).toLocaleString()

  // Update user total
  userTotals[msg.user] = (userTotals[msg.user] || 0) + msg.diceResult

  // Create a new li element for the game message
  let item = document.createElement('li')
  item.classList.add('game-message')

  // Set the text content of the li element
  item.textContent = `${msg.user}: Roll - Dice Result: ${
    msg.diceResult
  }, Total: ${userTotals[msg.user]} (${formattedDate})`

  diceContainer.appendChild(item)
})

socket.on('gameWinner', (data) => {
  // Display the end game message with the winner and the total reached
  endGameMessage.textContent = `${data.winner} has won the game with a total of ${data.total} points!`

  setTimeout(() => {
    endGameMessage.textContent = ''
  }, 5000)
  // Restart the game
  socket.emit('restartGame')
})

// socket.on('gameRestarted', () => {
//   // Clear the end game message when the game is restarted
//   endGameMessage.textContent = ''
// })
