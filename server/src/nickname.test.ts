import { describe, it, expect } from 'vitest'
import { generateNickname } from './nickname.js'

describe('generateNickname', () => {
  it('항상 비어있지 않은 문자열을 반환한다', () => {
    for (let i = 0; i < 50; i++) {
      const nick = generateNickname()
      expect(typeof nick).toBe('string')
      expect(nick.length).toBeGreaterThan(0)
    }
  })

  it('형용사+명사 두 부분으로 구성된 한글 닉네임을 생성한다', () => {
    const nick = generateNickname()
    expect(nick).toMatch(/^[가-힣]+$/)
  })

  it('여러 번 호출 시 다양한 조합이 나온다 (완전 고정값이 아님)', () => {
    const nicks = new Set(Array.from({ length: 30 }, () => generateNickname()))
    expect(nicks.size).toBeGreaterThan(1)
  })
})
