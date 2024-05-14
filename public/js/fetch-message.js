export function createNode(element) {
  return document.createElement(element)
}

export function append(parent, el) {
  return parent.appendChild(el)
}

export default function fetchAndDisplayMessages() {
  const ul = document.querySelector('#allMessages')
  const url = 'http://localhost:3000/messages'

  // Clear existing messages
  ul.innerHTML = ''

  fetch(url)
    .then((resp) => resp.json())
    .then(function (data) {
      console.log(data)
      let message = data

      return message.map(function (data) {
        let li = createNode('li')
        const formattedDate = new Date(data.date).toLocaleString()
        // console.log('Original Date:', data.date)
        // console.log('Formatted Date:', formattedDate)
        li.innerHTML =
          data.user + ' : ' + data.message + ' (' + formattedDate + ')'
        append(ul, li)
      })
    })
    .catch(function (error) {
      console.log(error)
    })
}

// fetch(url)
//   .then((resp) => resp.json())
//   .then(function (data) {
//     console.log(data)
//     let message = data
//     return message.map(function (data) {
//       let li = createNode('li')
//       try {
//         const formattedDate = new Date(data.date).toLocaleString()
//         // console.log('Original Date:', data.date)
//         // console.log('Formatted Date:', formattedDate)
//         li.innerHTML =
//           data.user + ' : ' + data.message + ' (' + formattedDate + ')'
//         append(ul, li)
//       } catch (error) {
//         console.error('Error formatting date:', error)
//       }
//     })
//   })
//   .catch(function (error) {
//     console.log(error)
//   })
