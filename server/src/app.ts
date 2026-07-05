import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import { generateNickname } from './nickname.js'

// 허용 origin: 환경변수(CLIENT_ORIGIN, 콤마 구분)로 오버라이드 가능, 기본값은 배포/로컬 개발 주소
export const DEFAULT_ORIGINS = [
  'https://daenamu-soop.vercel.app',
  'http://localhost:5173',
  'https://localhost:5173',
]

export function resolveAllowedOrigins(env: string | undefined = process.env.CLIENT_ORIGIN): string[] {
  return env ? env.split(',').map(o => o.trim()) : DEFAULT_ORIGINS
}

export function makeCorsOrigin(allowedOrigins: string[]) {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // origin이 없는 요청(서버-서버, curl 등)은 허용
    // 허용되지 않은 origin은 에러를 던지지 않고 CORS 헤더만 생략 (브라우저가 차단)
    callback(null, !origin || allowedOrigins.includes(origin))
  }
}

export interface AppOptions {
  allowedOrigins?: string[]
  rateLimit?: number
  rateWindowMs?: number
  maxConnPerIp?: number
}

export function createApp(options: AppOptions = {}) {
  const allowedOrigins = options.allowedOrigins ?? resolveAllowedOrigins()
  const corsOrigin     = makeCorsOrigin(allowedOrigins)

  // Rate limit: 소켓당 메시지 타임스탬프 추적
  const RATE_LIMIT      = options.rateLimit ?? 5      // 최대 메시지 수
  const RATE_WINDOW     = options.rateWindowMs ?? 10_000 // 10초
  const MAX_CONN_PER_IP = options.maxConnPerIp ?? 10   // IP당 동시 연결 수 제한

  const app = express()
  app.use(helmet())
  app.use(cors({ origin: corsOrigin }))

  app.get('/health', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() })
  })

  const httpServer = createServer(app)

  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
    // 연결당 최대 버퍼 크기 제한
    maxHttpBufferSize: 1e4,
  })

  const connCountByIp = new Map<string, number>()

  io.on('connection', (socket) => {
    const ip = socket.handshake.address
    const currentCount = connCountByIp.get(ip) ?? 0
    if (currentCount >= MAX_CONN_PER_IP) {
      socket.disconnect(true)
      return
    }
    connCountByIp.set(ip, currentCount + 1)

    const nickname = generateNickname()
    socket.data.nickname = nickname as string
    socket.data.msgTimestamps = [] as number[]

    socket.emit('nickname', nickname)
    socket.emit('userCount', io.sockets.sockets.size)  // 신규 접속자에게 직접 전송
    io.emit('userCount', io.sockets.sockets.size)      // 전체 브로드캐스트

    socket.on('getCount', () => {
      socket.emit('userCount', io.sockets.sockets.size)
    })

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

      const safeId = typeof shoutId === 'string' && shoutId.length > 0 && shoutId.length <= 64
        ? shoutId
        : Math.random().toString(36).slice(2, 10)

      const msg = {
        id:        safeId,
        nickname:  socket.data.nickname as string,
        text:      safeText,
        original:  typeof original === 'string' ? original.trim().slice(0, 300) : undefined,
        timestamp: now,
      }
      io.emit('message', msg)
    })

    socket.on('disconnect', () => {
      const remaining = (connCountByIp.get(ip) ?? 1) - 1
      if (remaining <= 0) connCountByIp.delete(ip)
      else connCountByIp.set(ip, remaining)

      io.emit('userCount', io.sockets.sockets.size)
    })
  })

  return { app, httpServer, io }
}
