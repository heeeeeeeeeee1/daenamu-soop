import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { generateNickname } from './nickname.js'

const app = express()
app.use(cors())

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() })
})

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  // 연결당 최대 버퍼 크기 제한
  maxHttpBufferSize: 1e4,
})

// Rate limit: 소켓당 메시지 타임스탬프 추적
const RATE_LIMIT   = 5   // 최대 메시지 수
const RATE_WINDOW  = 10_000 // 10초

io.on('connection', (socket) => {
  const nickname = generateNickname()
  socket.data.nickname = nickname as string
  socket.data.msgTimestamps = [] as number[]

  socket.emit('nickname', nickname)
  io.emit('userCount', io.sockets.size)

  socket.on('shout', ({ text, original, shoutId }: { text: string; original?: string; shoutId?: string }) => {
    if (typeof text !== 'string' || text.trim().length === 0) return

    // Rate limiting
    const now = Date.now()
    const timestamps: number[] = socket.data.msgTimestamps
    const recent = timestamps.filter(t => now - t < RATE_WINDOW)
    if (recent.length >= RATE_LIMIT) return
    socket.data.msgTimestamps = [...recent, now]

    const safeText = text.trim().slice(0, 300)
    if (!safeText) return

    const msg = {
      id:        shoutId ?? Math.random().toString(36).slice(2, 10),
      nickname:  socket.data.nickname as string,
      text:      safeText,
      original:  typeof original === 'string' ? original.trim().slice(0, 300) : undefined,
      timestamp: now,
    }
    io.emit('message', msg)
  })

  socket.on('disconnect', () => {
    io.emit('userCount', io.sockets.size)
  })
})

const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`🎋 대나무숲 서버 포트 ${PORT} 실행 중`)
})
