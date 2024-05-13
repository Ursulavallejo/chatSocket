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

  //photo selctection based on the gender
  const gender = document.getElementById('genderSelect').value
  // generate a random number between 1 and 50 to change the photo is provide by the api
  const randomNumber = Math.floor(Math.random() * 50) + 1

  // userContainer.innerHTML = '<h2>Hi ' + myUser + '</h2>'
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

  // Append elements to user container
  append(userDiv, img)
  append(topDiv, userDiv)
  append(userStatusDiv, strong)
  append(userStatusDiv, statusDiv)
  append(topDiv, userStatusDiv)
  append(userContainer, topDiv)

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

  // Crear un elemento span para la fecha y aplicar la clase "date"
  let dateSpan = document.createElement('span')
  dateSpan.textContent = formattedDate
  dateSpan.classList.add('date')

  // Agregar el span de fecha al elemento li
  item.appendChild(dateSpan)

  messages.appendChild(item)
})
