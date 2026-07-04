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
})

io.on('connection', (socket) => {
  const nickname = generateNickname()
  socket.data.nickname = nickname as string

  socket.emit('nickname', nickname)
  io.emit('userCount', io.engine.clientsCount)

  socket.on('shout', ({ text, shoutId }: { text: string; shoutId?: string }) => {
    if (typeof text !== 'string' || text.trim().length === 0) return

    const msg = {
      // 클라이언트가 보낸 ID를 그대로 사용해 중복 방지
      id:        shoutId ?? Math.random().toString(36).slice(2, 10),
      nickname:  socket.data.nickname as string,
      text:      text.trim().slice(0, 300),
      timestamp: Date.now(),
    }
    io.emit('message', msg)
  })

  socket.on('disconnect', () => {
    io.emit('userCount', io.engine.clientsCount)
  })
})

const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`🎋 대나무숲 서버 포트 ${PORT} 실행 중`)
})
