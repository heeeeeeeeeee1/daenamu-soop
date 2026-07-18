import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import { generateNickname } from './nickname.js'
import { transform } from './transformDictionary.js'

// 허용 origin: 환경변수(CLIENT_ORIGIN, 콤마 구분)로 오버라이드 가능, 기본값은 배포/로컬 개발 주소
export const DEFAULT_ORIGINS = [
  'https://daenamu-soop.vercel.app',
  'http://localhost:5173',
  'https://localhost:5173',
]

export function resolveAllowedOrigins(env: string | undefined = process.env.CLIENT_ORIGIN): string[] {
  return env ? env.split(',').map(o => o.trim()) : DEFAULT_ORIGINS
}

// Render 등 리버스 프록시 뒤에 배포되면 socket.handshake.address가 프록시 자신의
// 주소로 잡혀서, IP당 동시 연결 제한이 사실상 "전체 서버 기준"으로 뭉개진다.
// TRUST_PROXY=1일 때만 X-Forwarded-For를 신뢰하도록 명시적으로 켜야 한다 —
// 프록시 없는 환경(로컬 등)에서 기본으로 켜두면 클라이언트가 헤더를 조작해
// 연결 제한/IP 추적을 통째로 우회할 수 있기 때문.
export function resolveTrustProxy(env: string | undefined = process.env.TRUST_PROXY): boolean {
  return env === '1' || env === 'true'
}

export function resolveClientIp(
  handshake: { address: string; headers: Record<string, string | string[] | undefined> },
  trustProxy: boolean,
): string {
  if (trustProxy) {
    const header = handshake.headers['x-forwarded-for']
    const first = Array.isArray(header) ? header[0] : header
    // X-Forwarded-For: <client>, <proxy1>, <proxy2>, ... — 가장 왼쪽이 원 클라이언트
    const ip = first?.split(',')[0]?.trim()
    if (ip) return ip
  }
  return handshake.address
}

export function makeCorsOrigin(allowedOrigins: string[]) {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // origin이 없는 요청(서버-서버, curl 등)은 허용
    // 허용되지 않은 origin은 에러를 던지지 않고 CORS 헤더만 생략 (브라우저가 차단)
    callback(null, !origin || allowedOrigins.includes(origin))
  }
}

export interface ReportPayload {
  reporterNickname: string
  reportedNickname: string
  reportedText: string
  reportedOriginal?: string
  messageId: string
}

export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<unknown>

export interface AppOptions {
  allowedOrigins?: string[]
  rateLimit?: number
  rateWindowMs?: number
  maxConnPerIp?: number
  trustProxy?: boolean
  reportLimit?: number
  reportWindowMs?: number
  reportWebhookUrl?: string
  fetchImpl?: FetchLike
}

export function createApp(options: AppOptions = {}) {
  const allowedOrigins = options.allowedOrigins ?? resolveAllowedOrigins()
  const corsOrigin     = makeCorsOrigin(allowedOrigins)
  const trustProxy     = options.trustProxy ?? resolveTrustProxy()

  // Rate limit: 소켓당 메시지 타임스탬프 추적
  const RATE_LIMIT      = options.rateLimit ?? 5      // 최대 메시지 수
  const RATE_WINDOW     = options.rateWindowMs ?? 10_000 // 10초
  const MAX_CONN_PER_IP = options.maxConnPerIp ?? 10   // IP당 동시 연결 수 제한

  // 신고 rate limit (신고 남용 방지) 및 Discord 웹훅 설정
  const REPORT_LIMIT      = options.reportLimit ?? 3
  const REPORT_WINDOW     = options.reportWindowMs ?? 60_000 // 1분
  const REPORT_WEBHOOK_URL = options.reportWebhookUrl ?? process.env.REPORT_WEBHOOK_URL
  const fetchImpl: FetchLike = options.fetchImpl ?? ((url, init) => fetch(url, init))

  async function sendReportWebhook(info: ReportPayload): Promise<void> {
    if (!REPORT_WEBHOOK_URL) return
    try {
      await fetchImpl(REPORT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🚩 메시지 신고',
            color: 0xed4245,
            fields: [
              { name: '신고자', value: info.reporterNickname, inline: true },
              { name: '작성자', value: info.reportedNickname, inline: true },
              { name: '변환된 문구', value: info.reportedText || '(없음)' },
              ...(info.reportedOriginal ? [{ name: '원문', value: info.reportedOriginal }] : []),
            ],
            timestamp: new Date().toISOString(),
          }],
        }),
      })
    } catch (err) {
      console.error('신고 웹훅 전송 실패:', err)
    }
  }

  const app = express()
  app.set('trust proxy', trustProxy)
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
    const ip = resolveClientIp(socket.handshake, trustProxy)
    const currentCount = connCountByIp.get(ip) ?? 0
    if (currentCount >= MAX_CONN_PER_IP) {
      socket.disconnect(true)
      return
    }
    connCountByIp.set(ip, currentCount + 1)

    const nickname = generateNickname()
    socket.data.nickname = nickname as string
    socket.data.msgTimestamps = [] as number[]
    socket.data.reportTimestamps = [] as number[]

    socket.emit('nickname', nickname)
    socket.emit('userCount', io.sockets.sockets.size)  // 신규 접속자에게 직접 전송
    io.emit('userCount', io.sockets.sockets.size)      // 전체 브로드캐스트

    socket.on('getCount', () => {
      socket.emit('userCount', io.sockets.sockets.size)
    })

    socket.on('shout', ({ text, original, shoutId }: { text?: string; original?: string; shoutId?: string }) => {
      // 클라이언트가 보낸 text(이미 "변환됐다"고 주장하는 문구)는 신뢰하지 않는다.
      // 그걸 그대로 믿으면 콘솔에서 socket.emit으로 마스킹 안 된 원문을 그대로
      // 뿌릴 수 있으므로, 서버가 원문을 대상으로 순화 로직을 직접 재실행해서
      // 실제로 브로드캐스트할 문구를 스스로 결정한다.
      const safeOriginal = typeof original === 'string' ? original.trim().slice(0, 300) : undefined
      const rawInput = safeOriginal || (typeof text === 'string' ? text.trim() : '')
      if (!rawInput) return

      // Rate limiting
      const now = Date.now()
      const timestamps: number[] = socket.data.msgTimestamps
      const recent = timestamps.filter(t => now - t < RATE_WINDOW)
      if (recent.length >= RATE_LIMIT) return
      socket.data.msgTimestamps = [...recent, now]

      const safeText = transform(rawInput).slice(0, 300)
      if (!safeText) return

      const safeId = typeof shoutId === 'string' && shoutId.length > 0 && shoutId.length <= 64
        ? shoutId
        : Math.random().toString(36).slice(2, 10)

      const msg = {
        id:        safeId,
        nickname:  socket.data.nickname as string,
        text:      safeText,
        original:  safeOriginal,
        timestamp: now,
      }
      io.emit('message', msg)
    })

    // 신고: 신고 내용만 관리자 웹훅으로 전달. 서버는 메시지 히스토리를 저장하지
    // 않으므로, 신고 대상 메시지의 내용은 클라이언트가 그 순간의 값을 함께 보낸다.
    socket.on('report', (payload: { messageId?: string; nickname?: string; text?: string; original?: string }) => {
      const now = Date.now()
      const timestamps: number[] = socket.data.reportTimestamps
      const recent = timestamps.filter(t => now - t < REPORT_WINDOW)
      if (recent.length >= REPORT_LIMIT) return
      socket.data.reportTimestamps = [...recent, now]

      if (!payload || typeof payload.messageId !== 'string' || typeof payload.text !== 'string') return

      void sendReportWebhook({
        reporterNickname: socket.data.nickname as string,
        reportedNickname: typeof payload.nickname === 'string' ? payload.nickname.slice(0, 50) : '알 수 없음',
        reportedText: payload.text.slice(0, 300),
        reportedOriginal: typeof payload.original === 'string' ? payload.original.slice(0, 300) : undefined,
        messageId: payload.messageId.slice(0, 64),
      })

      socket.emit('reportAck')
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
