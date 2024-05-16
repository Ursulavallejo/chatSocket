const socket = io()
import fetchAndDisplayMessages, {
  createNode,
  append,
} from './js/fetch-message.js'

//CHAT query selectors
const formUser = document.querySelector('#formUser')
const inputUser = document.querySelector('#inputUser')
const messages = document.querySelector('#messages')
const formChatMessage = document.querySelector('#formChatMessage')
const userContainer = document.querySelector('#userContainer')
const clock = document.querySelector('#clock')
const buttonShowChatHistoric = document.querySelector('#button-view-data')
const buttonHideChatHistoric = document.querySelector('#button-hide-data')

//GAME query selectors
const rollDiceButton = document.querySelector('#roll')
const buttonContainer = document.querySelector('#button-game')
const board = document.querySelector('#board')

const textResultGame = document.querySelector('.text-resultsGame')
const endGameMessage = document.querySelector('#endGameMessage')

// Disable the roll dice button initially
rollDiceButton.disabled = true
let myUser = null
let userTotals = {}

// CHAT >>>>>>

formUser.addEventListener('submit', function (e) {
  e.preventDefault()
  const username = inputUser.value.trim()

  if (!username) {
    document.getElementById('usernameError').style.display = 'block'
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

// GAME >>>>>

function rollDiceButtonClickHandler() {
  let rollSound = new Audio('./assets/roll.wav')
  console.log('buttonRoll')

  // Trigger the rolling animation by adding a CSS class to the dice container
  const diceContainer = document.querySelector('.dice-container')
  diceContainer.classList.add('rolling')

  // Emit a "gameMessage" event to the server
  setTimeout(() => {
    socket.emit('gameMessage', {
      user: myUser,
      total: userTotals[myUser],
    })
  }, 1000)
  rollSound.play()
}

// Add event listener to the roll dice button
rollDiceButton.addEventListener('click', rollDiceButtonClickHandler)

// for the error message when not loged in
board.addEventListener('click', rollDiceButtonClickHandler)

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

  textResultGame.appendChild(item)
  // Remove rolling animation after a delay
  setTimeout(() => {
    const diceContainer = document.querySelector('.dice-container')
    diceContainer.classList.remove('rolling')

    // Update the dice face image based on the dice result
    const diceFace = document.querySelector('.dice .face')
    diceFace.src = `./assets/dice${msg.diceResult}.png`
  }, 500) // Adjust the delay to match the animation duration plus a buffer
})

socket.on('gameWinner', (data) => {
  // Check if there are other players
  const winnerMessage =
    Object.keys(userTotals).length > 1
      ? `${data.winner} has won the game with a total of ${data.total} points!`
      : 'You have exceeded 21 points and lost the game.'

  // Display the end game message
  endGameMessage.textContent = winnerMessage

  // Display the end game message with the winner and the total reached
  // endGameMessage.textContent = `${data.winner} has won the game with a total of ${data.total} points!`

  // Disable the roll dice button
  rollDiceButton.disabled = true

  // Show a new button to reset or play again
  const resetButton = document.createElement('button')
  resetButton.textContent = 'Reset'
  resetButton.id = 'reset-button'
  buttonContainer.appendChild(resetButton)

  // Add event listener to the reset button
  resetButton.addEventListener('click', () => {
    // Enable the roll dice button
    rollDiceButton.disabled = false

    // Remove the reset button
    resetButton.remove()

    // Clear the end game message
    endGameMessage.textContent = ''

    userTotals = {}

    // Emit an event to reset the game
    socket.emit('resetGame')
    console.log('GameWinner')
  })
})

socket.on('errorMessage', (data) => {
  console.log('error', data)
  endGameMessage.textContent = `${data.message}`
  setTimeout(() => {
    endGameMessage.textContent = ''
    const diceContainer = document.querySelector('.dice-container')
    diceContainer.classList.remove('rolling')
  }, 1000)
})

socket.on('gameReset', () => {
  console.log('gamereset')
  // Clear the end game message on the client side
  if (endGameMessage) {
    // Remove the redefinition of endGameMessage
    endGameMessage.textContent = 'the game is reset!! Ready to play again..'
    setTimeout(() => {
      endGameMessage.textContent = ''
    }, 3000)
  }

  // Clear the dice results
  const textResultGame = document.querySelector('.text-resultsGame')
  if (textResultGame) {
    textResultGame.innerHTML = ''
  }

  // Remove the reset button
  const resetButton = document.querySelector('#reset-button')
  if (resetButton) {
    resetButton.remove()
  }

  // Enable the roll dice button
  const rollDiceButton = document.querySelector('#roll')
  if (rollDiceButton) {
    rollDiceButton.disabled = false

    // rollDiceButton.addEventListener('click', rollDiceButtonClickHandler)
  }
})
