const socket = io()

const formUser = document.querySelector('#formUser')
const inputUser = document.querySelector('#inputUser')
const messages = document.querySelector('#messages')
const form = document.querySelector('#formChatMessage')
const input = document.querySelector('#inputChatMessage')
const userContainer = document.querySelector('#userContainer')
const clock = document.querySelector('#clock')

let myUser

formUser.addEventListener('submit', function (e) {
  e.preventDefault()
  myUser = inputUser.value
  userContainer.innerHTML = '<h2>Hi ' + myUser + '</h2>'
  document.querySelector('#user').style.display = 'none'
  document.querySelector('#chat-message').style.display = 'block'
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

//Nu lägger vi till koden som visar alla meddelande som har skickats från de som är anslutna.
socket.on('newChatMessage', function (msg) {
  let item = document.createElement('li')
  const formattedDate = new Date(msg.date).toLocaleString()
  // item.textContent = msg
  item.textContent = msg.user + ': ' + msg.message + ' (' + formattedDate + ')'
  messages.appendChild(item)
})
