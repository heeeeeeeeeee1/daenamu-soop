import { describe, it, expect } from 'vitest'
import { cellName, getCellText } from './cellHelpers'
import type { ChatMessage } from '../components/ChatPanel'

const TODAY = '07/05'

const msgs: ChatMessage[] = [
  { id: '1', nickname: '성난다람쥐', text: '일정 확인 부탁드립니다.', original: '아 존나 짜증나', timestamp: 1_700_000_000_000 },
  { id: '2', nickname: '지친대나무', text: '검토 후 말씀드리겠습니다.', timestamp: 1_700_000_100_000 },
]

describe('cellName', () => {
  it('열 인덱스를 알파벳으로, 행 번호와 조합해 셀 이름을 만든다', () => {
    expect(cellName({ row: 1, col: 0 })).toBe('A1')
    expect(cellName({ row: 5, col: 2 })).toBe('C5')
    expect(cellName({ row: 10, col: 4 })).toBe('E10')
  })
})

describe('getCellText', () => {
  it('1행은 항상 헤더 텍스트를 반환한다 (메시지 유무와 무관)', () => {
    expect(getCellText(msgs, { row: 1, col: 0 }, TODAY)).toBe('날짜')
    expect(getCellText(msgs, { row: 1, col: 1 }, TODAY)).toBe('담당자')
    expect(getCellText(msgs, { row: 1, col: 2 }, TODAY)).toBe('업무 내용')
    expect(getCellText(msgs, { row: 1, col: 3 }, TODAY)).toBe('원문 (비고)')
    expect(getCellText(msgs, { row: 1, col: 4 }, TODAY)).toBe('시간')
  })

  it('데이터 행은 각 열에 맞는 값을 반환한다', () => {
    // msgs[0] -> row 2
    expect(getCellText(msgs, { row: 2, col: 0 }, TODAY)).toBe(TODAY)
    expect(getCellText(msgs, { row: 2, col: 1 }, TODAY)).toBe('성난다람쥐')
    expect(getCellText(msgs, { row: 2, col: 2 }, TODAY)).toBe('일정 확인 부탁드립니다.')
    expect(getCellText(msgs, { row: 2, col: 3 }, TODAY)).toBe('(비공개)')
  })

  it('원문(D열)은 실제 원문 텍스트를 노출하지 않고 항상 "(비공개)"만 반환한다', () => {
    // getCellText는 이름상자/수식입력줄 값 계산에 쓰이므로, 여기서 원문이 새어나가면
    // 마스킹 기능(클릭 전까지 원문 비공개)이 무력화된다.
    const text = getCellText(msgs, { row: 2, col: 3 }, TODAY)
    expect(text).not.toContain('존나')
    expect(text).toBe('(비공개)')
  })

  it('범위를 벗어난 행/열은 빈 문자열을 반환한다', () => {
    expect(getCellText(msgs, { row: 99, col: 0 }, TODAY)).toBe('')
    expect(getCellText(msgs, { row: 2, col: 99 }, TODAY)).toBe('')
  })

  it('메시지가 없는 경우(빈 배열)에도 헤더 행은 정상 동작한다', () => {
    expect(getCellText([], { row: 1, col: 2 }, TODAY)).toBe('업무 내용')
    expect(getCellText([], { row: 2, col: 2 }, TODAY)).toBe('')
  })
})
