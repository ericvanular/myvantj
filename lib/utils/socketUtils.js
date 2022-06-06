import io from 'socket.io-client'
let socket

export const initiateSocket = (token) => {
  socket = io(`${process.env.NEXT_PUBLIC_API}`, {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  })
  socket && socket.emit('join')
}

export const disconnectSocket = () => {
  socket && socket.disconnect()
}

export const switchRooms = (prevRoom, nextRoom) => {
  socket && socket.emit('switch_room', { prev_room: prevRoom, next_room: nextRoom })
}

export const subscribeToChat = (cb) => {
  if (socket) {
    socket.on('message_sent', (msg) => {
      console.log('Chat message event received')
      return cb(null, msg)
    })
  }
}

export const sendMessage = (message, room) => {
  socket && socket.emit('send_message', { body: message, room })
}

export const subscribeToTransactions = (cb) => {
  if (socket) {
    socket.on('transaction_event_sent', (status) => {
      console.log('Transaction event received')
      return cb(null, status)
    })
  }
}

export default socket
