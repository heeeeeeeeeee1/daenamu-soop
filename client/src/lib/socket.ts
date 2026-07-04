import { io, Socket } from 'socket.io-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SOCKET_URL: string = ((import.meta as any).env?.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:3001'

export const socket: Socket = io(SOCKET_URL, {
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 5000,
  autoConnect: true,
})
