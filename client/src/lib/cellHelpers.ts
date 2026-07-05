import type { CellAddr } from '../types'
import type { ChatMessage } from '../components/ChatPanel'

const COL_LETTERS = ['A', 'B', 'C', 'D', 'E']

export function cellName(c: CellAddr): string {
  return `${COL_LETTERS[c.col]}${c.row}`
}

export function getCellText(msgs: ChatMessage[], cell: CellAddr, today: string): string {
  if (cell.row === 1) {
    return ['날짜', '담당자', '업무 내용', '원문 (비고)', '시간'][cell.col] ?? ''
  }
  const msg = msgs[cell.row - 2]
  if (!msg) return ''
  switch (cell.col) {
    case 0: return today
    case 1: return msg.nickname
    case 2: return msg.text
    case 3: return '(비공개)'
    case 4: return new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
    default: return ''
  }
}
