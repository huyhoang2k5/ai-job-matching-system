import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: {
        token,
      },
      transports: ['websocket'],
    })
  }
  return socket
}

export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    s.auth = { token }
    s.connect()
  }
  return s
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
