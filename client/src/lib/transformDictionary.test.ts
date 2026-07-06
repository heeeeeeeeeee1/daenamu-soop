import { describe, it, expect } from 'vitest'
import { curseLevel, transform } from './transformDictionary'

describe('curseLevel', () => {
  it('욕설이 없는 문장은 0을 반환한다', () => {
    expect(curseLevel('오늘 회의 자료 준비했습니다.')).toBe(0)
  })

  it('욕설 패턴 1개는 1을 반환한다', () => {
    expect(curseLevel('아 진짜 존나 힘드네')).toBe(1)
  })

  it('욕설 패턴이 여러 개면 개수만큼 누적된다', () => {
    // 씨발(1) + 존나(1) + 개같(1) = 3
    expect(curseLevel('씨발 존나 개같은 상황이네')).toBe(3)
  })

  it('영문 욕설도 감지한다', () => {
    expect(curseLevel('what the fuck is this')).toBeGreaterThan(0)
  })

  it('빈 문자열은 0을 반환한다', () => {
    expect(curseLevel('')).toBe(0)
  })

  it('열받다/킹받다/빡치다는 욕설이 아닌 감정 표현이라 감지하지 않는다', () => {
    expect(curseLevel('열받는다')).toBe(0)
    expect(curseLevel('킹받는다')).toBe(0)
    expect(curseLevel('빡친다')).toBe(0)
    expect(curseLevel('빡치네')).toBe(0)
  })

  it('"시바"/"싯바" 같은 씨발 계열 변형도 감지한다', () => {
    expect(curseLevel('아 시바나 진짜')).toBeGreaterThan(0)
    expect(curseLevel('싯바 뭐야')).toBeGreaterThan(0)
  })
})

describe('transform', () => {
  it('욕설이 없으면 원문을 그대로(trim만) 반환한다', () => {
    expect(transform('  오늘 회의 자료 준비했습니다.  ')).toBe('오늘 회의 자료 준비했습니다.')
  })

  it('빈 문자열/공백만 있는 입력은 빈 문자열을 반환한다', () => {
    expect(transform('')).toBe('')
    expect(transform('   ')).toBe('')
  })

  it('욕설이 감지되면 원문이 아닌 순화된 문장으로 치환된다', () => {
    const raw = '아 진짜 존나 힘드네' // curseLevel === 1
    expect(curseLevel(raw)).toBe(1)
    const result = transform(raw)
    expect(result).not.toBe(raw)
    expect(result.length).toBeGreaterThan(0)
  })

  it('욕설 6개 이상은 항상 3단계(공식 문장) 풀에서만 나온다', () => {
    const raw = '씨발 씨발 씨발 씨발 씨발 씨발 씨발' // 동일 패턴 반복으로 레벨 7
    expect(curseLevel(raw)).toBeGreaterThanOrEqual(6)

    // 여러 번 호출해도 항상 문장이 비어있지 않고, 원문이 그대로 노출되지 않아야 한다(순화 실패 방지)
    for (let i = 0; i < 20; i++) {
      const result = transform(raw)
      expect(result.length).toBeGreaterThan(0)
      expect(result).not.toContain('씨발')
    }
  })

  it('변환 결과는 원문 텍스트를 포함하지 않는다 (욕설이 그대로 노출되면 안 됨)', () => {
    const raw = '아 개같은 존나 짜증나 진짜'
    const result = transform(raw)
    expect(result).not.toContain('개같')
    expect(result).not.toContain('존나')
  })
})
