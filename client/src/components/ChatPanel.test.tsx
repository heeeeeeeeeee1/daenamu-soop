import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatPanel, { type ChatMessage } from './ChatPanel'
import type { ColWidths } from '../types'

const colWidths: ColWidths = { A: 56, B: 110, D: 90, E: 60 }

const baseMsgs: ChatMessage[] = [
  { id: 'm1', nickname: '성난다람쥐', text: '일정 확인 부탁드립니다.', original: '아 존나 짜증나네', timestamp: Date.now() },
  { id: 'm2', nickname: '지친대나무', text: '검토 후 말씀드리겠습니다.', timestamp: Date.now() },
]

function setup(overrides: Partial<React.ComponentProps<typeof ChatPanel>> = {}) {
  const onToggleSelect = vi.fn()
  const onCellClick = vi.fn()
  const props = {
    messages: baseMsgs,
    myNickname: '성난다람쥐',
    today: '07/05',
    selectedIds: new Set<string>(),
    onToggleSelect,
    activeCell: null,
    onCellClick,
    colWidths,
    ...overrides,
  }
  const utils = render(<ChatPanel {...props} />)
  return { ...utils, onToggleSelect, onCellClick }
}

describe('ChatPanel', () => {
  it('헤더 행과 각 메시지의 행을 렌더링한다', () => {
    setup()
    expect(screen.getByText('업무 내용')).toBeInTheDocument()
    expect(screen.getByText('일정 확인 부탁드립니다.')).toBeInTheDocument()
    expect(screen.getByText('검토 후 말씀드리겠습니다.')).toBeInTheDocument()
    expect(screen.getByText('성난다람쥐')).toBeInTheDocument()
    expect(screen.getByText('지친대나무')).toBeInTheDocument()
  })

  it('메시지가 없으면 "데이터 없음" 안내를 보여준다', () => {
    setup({ messages: [] })
    expect(screen.getByText('— 데이터 없음 —')).toBeInTheDocument()
  })

  it('원문은 기본적으로 마스킹되어 있고, 클릭하면 토글로 보였다 숨겨진다', async () => {
    setup()
    const masked = screen.getByTitle('클릭하여 보기')
    expect(masked.textContent).toMatch(/^\*+$/)

    await userEvent.click(masked)
    expect(masked.textContent).toBe('아 존나 짜증나네')

    await userEvent.click(masked)
    expect(masked.textContent).toMatch(/^\*+$/)
  })

  it('한 행의 마스킹 해제가 다른 행에 영향을 주지 않는다', async () => {
    const msgs: ChatMessage[] = [
      ...baseMsgs,
      { id: 'm3', nickname: '억울한직장인', text: '자료 준비하겠습니다.', original: '진짜 개빡치네', timestamp: Date.now() },
    ]
    setup({ messages: msgs })
    const maskedCells = screen.getAllByTitle('클릭하여 보기')
    expect(maskedCells).toHaveLength(2) // m1, m3 (m2는 original 없음)

    await userEvent.click(maskedCells[0])
    expect(maskedCells[0].textContent).toBe('아 존나 짜증나네')
    expect(maskedCells[1].textContent).toMatch(/^\*+$/) // 다른 행은 그대로 마스킹 유지
  })

  it('행 번호를 클릭하면 onToggleSelect가 해당 메시지 id로 호출된다', async () => {
    const { onToggleSelect } = setup()
    await userEvent.click(screen.getByText('2')) // m1 -> rowNum 2
    expect(onToggleSelect).toHaveBeenCalledWith('m1', false)
  })

  it('Ctrl+클릭 시 multi=true로 onToggleSelect가 호출된다', () => {
    const { onToggleSelect } = setup()
    fireEvent.click(screen.getByText('3'), { ctrlKey: true }) // m2 -> rowNum 3
    expect(onToggleSelect).toHaveBeenCalledWith('m2', true)
  })

  it('activeCell과 일치하는 셀만 active 클래스를 갖는다', () => {
    setup({ activeCell: { row: 2, col: 2 } })
    const activeCell = screen.getByText('일정 확인 부탁드립니다.')
    expect(activeCell.className).toContain('xl-cell-active')

    const otherCell = screen.getByText('검토 후 말씀드리겠습니다.')
    expect(otherCell.className).not.toContain('xl-cell-active')
  })

  it('데이터 셀 클릭 시 onCellClick이 (row, col)로 호출된다', async () => {
    const { onCellClick } = setup()
    await userEvent.click(screen.getByText('검토 후 말씀드리겠습니다.')) // m2 -> rowNum 3, col 2
    expect(onCellClick).toHaveBeenCalledWith(3, 2)
  })

  it('위로 스크롤해 둔 상태에서 새 메시지가 오면 강제로 맨 아래로 내리지 않는다', () => {
    const { container, rerender } = setup()
    const rowsEl = container.querySelector('.xl-rows') as HTMLDivElement

    // jsdom은 실제 레이아웃을 계산하지 않으므로 스크롤 상태를 직접 흉내낸다.
    Object.defineProperty(rowsEl, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(rowsEl, 'clientHeight', { value: 300, configurable: true })
    Object.defineProperty(rowsEl, 'scrollTop', { value: 50, writable: true, configurable: true }) // 맨 위 근처

    const withNewMsg: ChatMessage[] = [
      ...baseMsgs,
      { id: 'm3', nickname: '새사람', text: '새 메시지 도착', timestamp: Date.now() },
    ]
    rerender(<ChatPanel
      messages={withNewMsg} myNickname="성난다람쥐" today="07/05"
      selectedIds={new Set()} onToggleSelect={vi.fn()} activeCell={null}
      onCellClick={vi.fn()} colWidths={colWidths}
    />)

    expect(rowsEl.scrollTop).toBe(50) // 그대로 유지되어야 함 (강제 스크롤 없음)
  })

  it('바닥 근처에 있었다면 새 메시지가 오면 맨 아래로 따라간다', () => {
    const { container, rerender } = setup()
    const rowsEl = container.querySelector('.xl-rows') as HTMLDivElement

    Object.defineProperty(rowsEl, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(rowsEl, 'clientHeight', { value: 300, configurable: true })
    Object.defineProperty(rowsEl, 'scrollTop', { value: 690, writable: true, configurable: true }) // 바닥과 10px 차이

    const withNewMsg: ChatMessage[] = [
      ...baseMsgs,
      { id: 'm3', nickname: '새사람', text: '새 메시지 도착', timestamp: Date.now() },
    ]
    rerender(<ChatPanel
      messages={withNewMsg} myNickname="성난다람쥐" today="07/05"
      selectedIds={new Set()} onToggleSelect={vi.fn()} activeCell={null}
      onCellClick={vi.fn()} colWidths={colWidths}
    />)

    expect(rowsEl.scrollTop).toBe(1000) // scrollHeight까지 따라 내려가야 함
  })
})
