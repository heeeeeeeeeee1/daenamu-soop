import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client'
import type { AddressInfo } from 'net'
import { createApp } from './app.js'

function waitFor<T = unknown>(socket: ClientSocket, event: string, timeoutMs = 2000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for "${event}"`)), timeoutMs)
    socket.once(event, (payload: T) => { clearTimeout(timer); resolve(payload) })
  })
}

async function startApp(options: Parameters<typeof createApp>[0] = {}) {
  const { httpServer } = createApp(options)
  await new Promise<void>(resolve => httpServer.listen(0, resolve))
  const { port } = httpServer.address() as AddressInfo
  return {
    baseUrl: `http://localhost:${port}`,
    close: () => new Promise<void>(resolve => httpServer.close(() => resolve())),
  }
}

describe('daenamu-soop 서버 통합 테스트', () => {
  let baseUrl: string
  let closeApp: () => Promise<void>
  const clients: ClientSocket[] = []

  function connectClient(): ClientSocket {
    const socket = ioClient(baseUrl, { transports: ['websocket'], forceNew: true })
    clients.push(socket)
    return socket
  }

  beforeAll(async () => {
    const started = await startApp({ rateLimit: 3, rateWindowMs: 500 })
    baseUrl = started.baseUrl
    closeApp = started.close
  })

  afterEach(() => {
    while (clients.length) clients.pop()?.disconnect()
  })

  afterAll(async () => {
    await closeApp()
  })

  it('GET /health는 ok:true와 uptime을 반환한다', async () => {
    const res = await fetch(`${baseUrl}/health`)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(typeof body.uptime).toBe('number')
  })

  it('연결 시 닉네임과 접속자 수를 받는다', async () => {
    const socket = connectClient()
    // 서버가 연결 직후 'nickname'과 'userCount'를 연달아 동기적으로 emit하므로,
    // 순차적으로 await하면 두 번째 리스너를 등록하기 전에 이벤트를 놓칠 수 있다.
    // 두 리스너를 먼저 동시에 등록한 뒤 함께 기다린다.
    const [nickname, count] = await Promise.all([
      waitFor<string>(socket, 'nickname'),
      waitFor<number>(socket, 'userCount'),
    ])
    expect(typeof nickname).toBe('string')
    expect(nickname.length).toBeGreaterThan(0)
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it('getCount 요청 시 현재 접속자 수를 응답한다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'userCount') // 최초 접속 브로드캐스트 소비
    socket.emit('getCount')
    const count = await waitFor<number>(socket, 'userCount')
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it('shout 메시지가 다른 접속자에게 브로드캐스트된다 (text는 서버가 original로부터 직접 계산)', async () => {
    const a = connectClient()
    const b = connectClient()
    await Promise.all([waitFor(a, 'nickname'), waitFor(b, 'nickname')])

    const received = waitFor<{ text: string; original?: string; id: string; nickname: string; timestamp: number }>(b, 'message')
    a.emit('shout', { text: '테스트 메시지', original: '원본', shoutId: 'abc123' })
    const msg = await received

    // original에 욕설이 없으므로 서버가 재계산한 text는 원문 그대로다.
    // 클라이언트가 보낸 text('테스트 메시지')와는 무관하다는 점이 핵심.
    expect(msg.text).toBe('원본')
    expect(msg.original).toBe('원본')
    expect(msg.id).toBe('abc123')
    expect(typeof msg.nickname).toBe('string')
    expect(typeof msg.timestamp).toBe('number')
  })

  it('클라이언트가 보낸 text는 무시하고 서버가 original을 직접 변환한다 (마스킹 우회 방지)', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    const received = waitFor<{ text: string; original?: string }>(socket, 'message')
    socket.emit('shout', {
      text: '조작된 안전한 문구',                      // 클라이언트가 위조한 값 — 서버가 무시해야 함
      original: '시발 개새끼 병신 존나 미친놈 지랄',      // 실제 원문 (욕설 다수, 3단계)
    })
    const msg = await received

    expect(msg.text).not.toBe('조작된 안전한 문구')
    expect(msg.text).not.toContain('시발')
    expect(msg.text).not.toContain('개새끼')
    expect(msg.original).toBe('시발 개새끼 병신 존나 미친놈 지랄')
  })

  it('original 없이 text만 보내도 text 자체가 욕설 필터링 대상이 된다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    const received = waitFor<{ text: string }>(socket, 'message')
    socket.emit('shout', { text: '이 미친 시발 프로젝트' })
    const msg = await received

    expect(msg.text).not.toContain('시발')
    expect(msg.text).not.toContain('미친')
    expect(msg.text).not.toBe('이 미친 시발 프로젝트')
  })

  it('공백만 있는 shout는 무시된다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    let received = false
    socket.once('message', () => { received = true })
    socket.emit('shout', { text: '   ' })

    await new Promise(r => setTimeout(r, 200))
    expect(received).toBe(false)
  })

  it('300자를 초과하는 텍스트는 300자로 잘린다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    const longText = '가'.repeat(400)
    const received = waitFor<{ text: string }>(socket, 'message')
    socket.emit('shout', { text: longText })
    const msg = await received
    expect(msg.text.length).toBe(300)
  })

  it('64자를 초과하는 shoutId는 서버가 새 id로 대체한다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    const longId = 'x'.repeat(100)
    const received = waitFor<{ id: string }>(socket, 'message')
    socket.emit('shout', { text: '아이디 테스트', shoutId: longId })
    const msg = await received

    expect(msg.id).not.toBe(longId)
    expect(msg.id.length).toBeLessThanOrEqual(64)
  })

  it('64자 이하의 shoutId는 그대로 사용한다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    const received = waitFor<{ id: string }>(socket, 'message')
    socket.emit('shout', { text: '정상 아이디', shoutId: 'short-id-1' })
    const msg = await received

    expect(msg.id).toBe('short-id-1')
  })

  it('rate limit(3개/0.5초)를 초과하면 이후 메시지는 무시된다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    const receivedMessages: unknown[] = []
    socket.on('message', (m: unknown) => receivedMessages.push(m))

    for (let i = 0; i < 5; i++) {
      socket.emit('shout', { text: `메시지 ${i}` })
    }

    await new Promise(r => setTimeout(r, 300))
    expect(receivedMessages.length).toBe(3)
  })
})

describe('daenamu-soop 서버 - 신고(report) 기능', () => {
  let baseUrl: string
  let closeApp: () => Promise<void>
  const clients: ClientSocket[] = []
  let fetchCalls: Array<{ url: string; body: Record<string, unknown> }>

  function connectClient(): ClientSocket {
    const socket = ioClient(baseUrl, { transports: ['websocket'], forceNew: true })
    clients.push(socket)
    return socket
  }

  beforeAll(async () => {
    fetchCalls = []
    const started = await startApp({
      reportLimit: 2,
      reportWindowMs: 500,
      reportWebhookUrl: 'https://example.com/webhook',
      fetchImpl: async (url, init) => {
        fetchCalls.push({ url, body: JSON.parse(init.body) })
        return {}
      },
    })
    baseUrl = started.baseUrl
    closeApp = started.close
  })

  afterEach(() => {
    while (clients.length) clients.pop()?.disconnect()
    fetchCalls = []
  })

  afterAll(async () => {
    await closeApp()
  })

  it('유효한 신고를 받으면 웹훅으로 신고 내용을 전송하고 reportAck을 응답한다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    const ack = waitFor(socket, 'reportAck')
    socket.emit('report', { messageId: 'm1', nickname: '성난다람쥐', text: '변환된 문구', original: '원문' })
    await ack

    expect(fetchCalls).toHaveLength(1)
    expect(fetchCalls[0].url).toBe('https://example.com/webhook')
    const embed = (fetchCalls[0].body.embeds as Array<Record<string, unknown>>)[0]
    const fields = embed.fields as Array<{ name: string; value: string }>
    expect(fields.find(f => f.name === '작성자')?.value).toBe('성난다람쥐')
    expect(fields.find(f => f.name === '변환된 문구')?.value).toBe('변환된 문구')
    expect(fields.find(f => f.name === '원문')?.value).toBe('원문')
  })

  it('messageId나 text가 없으면 무시하고 웹훅을 호출하지 않는다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    let ackReceived = false
    socket.once('reportAck', () => { ackReceived = true })
    socket.emit('report', { nickname: '성난다람쥐' })

    await new Promise(r => setTimeout(r, 200))
    expect(fetchCalls).toHaveLength(0)
    expect(ackReceived).toBe(false)
  })

  it('rate limit(2개/0.5초)를 초과하는 신고는 무시된다', async () => {
    const socket = connectClient()
    await waitFor(socket, 'nickname')

    for (let i = 0; i < 4; i++) {
      socket.emit('report', { messageId: `m${i}`, text: `문구${i}` })
    }

    await new Promise(r => setTimeout(r, 300))
    expect(fetchCalls).toHaveLength(2)
  })
})

describe('daenamu-soop 서버 - IP당 동시 연결 제한', () => {
  let baseUrl: string
  let closeApp: () => Promise<void>
  const clients: ClientSocket[] = []

  function connectClient(): ClientSocket {
    const socket = ioClient(baseUrl, { transports: ['websocket'], forceNew: true })
    clients.push(socket)
    return socket
  }

  beforeAll(async () => {
    const started = await startApp({ maxConnPerIp: 2 })
    baseUrl = started.baseUrl
    closeApp = started.close
  })

  afterAll(async () => {
    clients.forEach(c => c.disconnect())
    await closeApp()
  })

  it('설정된 최대 연결 수(2개)를 초과하는 연결은 즉시 끊긴다', async () => {
    const c1 = connectClient()
    const c2 = connectClient()
    await Promise.all([waitFor(c1, 'nickname'), waitFor(c2, 'nickname')])

    const c3 = connectClient()
    await expect(waitFor(c3, 'disconnect')).resolves.toBeDefined()
  })
})

describe('daenamu-soop 서버 - 리버스 프록시 뒤 IP당 동시 연결 제한 (trustProxy)', () => {
  let baseUrl: string
  let closeApp: () => Promise<void>
  const clients: ClientSocket[] = []

  function connectWithForwardedFor(ip: string): ClientSocket {
    const socket = ioClient(baseUrl, {
      transports: ['websocket'],
      forceNew: true,
      extraHeaders: { 'x-forwarded-for': ip },
    })
    clients.push(socket)
    return socket
  }

  beforeAll(async () => {
    const started = await startApp({ maxConnPerIp: 1, trustProxy: true })
    baseUrl = started.baseUrl
    closeApp = started.close
  })

  afterEach(() => {
    while (clients.length) clients.pop()?.disconnect()
  })

  afterAll(async () => {
    await closeApp()
  })

  it('trustProxy=true면 X-Forwarded-For별로 연결을 따로 세서, 같은 프록시 뒤 서로 다른 사용자가 서로를 끊지 않는다', async () => {
    const a = connectWithForwardedFor('1.1.1.1')
    const b = connectWithForwardedFor('2.2.2.2')
    await expect(Promise.all([waitFor(a, 'nickname'), waitFor(b, 'nickname')])).resolves.toBeDefined()
  })

  it('trustProxy=true에서 같은 X-Forwarded-For로 제한(1개)을 초과하면 끊긴다', async () => {
    const a = connectWithForwardedFor('3.3.3.3')
    await waitFor(a, 'nickname')

    const b = connectWithForwardedFor('3.3.3.3')
    await expect(waitFor(b, 'disconnect')).resolves.toBeDefined()
  })
})
