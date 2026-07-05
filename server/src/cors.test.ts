import { describe, it, expect } from 'vitest'
import { DEFAULT_ORIGINS, resolveAllowedOrigins, makeCorsOrigin } from './app.js'

describe('resolveAllowedOrigins', () => {
  it('CLIENT_ORIGIN 환경변수가 없으면 기본 origin 목록을 사용한다', () => {
    expect(resolveAllowedOrigins(undefined)).toEqual(DEFAULT_ORIGINS)
  })

  it('CLIENT_ORIGIN이 있으면 콤마로 분리하고 공백을 제거한다', () => {
    expect(resolveAllowedOrigins('https://a.com, https://b.com ,https://c.com'))
      .toEqual(['https://a.com', 'https://b.com', 'https://c.com'])
  })
})

describe('makeCorsOrigin', () => {
  const corsOrigin = makeCorsOrigin(['https://daenamu-soop.vercel.app', 'http://localhost:5173'])

  function check(origin: string | undefined): Promise<boolean> {
    return new Promise((resolve, reject) => {
      corsOrigin(origin, (err, allow) => (err ? reject(err) : resolve(!!allow)))
    })
  }

  it('허용 목록에 있는 origin은 통과시킨다', async () => {
    await expect(check('https://daenamu-soop.vercel.app')).resolves.toBe(true)
    await expect(check('http://localhost:5173')).resolves.toBe(true)
  })

  it('허용 목록에 없는 origin은 거부한다 (에러를 던지지 않고 false)', async () => {
    await expect(check('https://evil.example.com')).resolves.toBe(false)
  })

  it('origin이 없는 요청(서버-서버, curl 등)은 허용한다', async () => {
    await expect(check(undefined)).resolves.toBe(true)
  })
})
