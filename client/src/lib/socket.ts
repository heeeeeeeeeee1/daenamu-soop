import { io, Socket } from 'socket.io-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SOCKET_URL: string = ((import.meta as any).env?.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:3001'

export const socket: Socket = io(SOCKET_URL, {
  // Render 무료 티어는 콜드스타트에 최대 30~60초 걸릴 수 있으므로
  // 재시도 횟수를 제한하지 않고 계속 재연결을 시도한다.
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 5000,
  autoConnect: true,
})
