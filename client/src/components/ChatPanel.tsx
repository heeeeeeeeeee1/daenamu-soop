import React, { useEffect, useRef, useState } from 'react'
import type { ColWidths } from '../types'

export interface ChatMessage {
  id: string
  nickname: string
  text: string
  original?: string
  timestamp: number
}

interface Props {
  messages: ChatMessage[]
  myNickname: string
  today: string
  selectedIds: Set<string>
  onToggleSelect: (id: string, multi: boolean) => void
  activeCell: { row: number; col: number } | null
  onCellClick: (row: number, col: number) => void
  colWidths: ColWidths
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

const MaskedCell: React.FC<{ text: string; mine?: boolean }> = ({ text, mine }) => {
  const [revealed, setRevealed] = useState(false)
  return (
    <span
      className={`xl-mask ${revealed ? 'xl-mask-on' : ''} ${mine ? 'xl-mask-mine' : ''}`}
      onClick={e => { e.stopPropagation(); setRevealed(r => !r) }}
      title={revealed ? '클릭하여 숨기기' : '클릭하여 보기'}
    >
      {revealed ? text : '*'.repeat(Math.min(text.length, 20))}
    </span>
  )
}

interface RowProps {
  msg: ChatMessage
  mine: boolean
  selected: boolean
  rowNum: number
  activeCol: number | null
  today: string
  colWidths: ColWidths
  onToggleSelect: (id: string, multi: boolean) => void
  onCellClick: (row: number, col: number) => void
}

const Row: React.FC<RowProps> = React.memo(({
  msg, mine, selected, rowNum, activeCol, today, colWidths, onToggleSelect, onCellClick,
}) => {
  const cell = (col: number, className: string, style: React.CSSProperties | undefined, content: React.ReactNode) => (
    <div
      className={`xl-cell ${className} ${activeCol === col ? 'xl-cell-active' : ''}`}
      style={style}
      onClick={e => { e.stopPropagation(); onCellClick(rowNum, col) }}
    >
      {content}
    </div>
  )

  return (
    <div
      className={[
        'xl-row',
        mine     ? 'xl-row-mine' : '',
        selected ? 'xl-row-selected' : '',
        'xl-row-new',
      ].join(' ')}
    >
      {/* 행 번호 — 클릭으로 행 선택 */}
      <div
        className={[
          'xl-rownum',
          selected ? 'xl-rownum-sel' : '',
          activeCol !== null && !selected ? 'xl-rownum-active' : '',
        ].join(' ')}
        onClick={e => { e.stopPropagation(); onToggleSelect(msg.id, e.ctrlKey || e.metaKey) }}
        title="클릭: 행 선택 (Delete로 삭제)"
      >
        {selected ? '▶' : rowNum}
      </div>

      {cell(0, 'xl-cell-date', { width: colWidths.A }, today)}
      {cell(1, 'xl-cell-nick', { width: colWidths.B }, msg.nickname)}
      {cell(2, 'xl-cellflex',  undefined,               msg.text)}
      {cell(3, 'xl-cell-orig', { width: colWidths.D },
        msg.original ? <MaskedCell text={msg.original} mine={mine} /> : null
      )}
      {cell(4, 'xl-cell-time', { width: colWidths.E }, formatTime(msg.timestamp))}
    </div>
  )
})
Row.displayName = 'Row'

const ChatPanel: React.FC<Props> = ({
  messages, myNickname, today, selectedIds, onToggleSelect, activeCell, onCellClick, colWidths,
}) => {
  const rowsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rowsRef.current
    if (!el) return
    // 사용자가 과거 메시지를 읽으려고 위로 스크롤해 둔 상태라면, 새 메시지가
    // 도착해도 강제로 맨 아래로 끌어내리지 않는다 (이미 바닥 근처일 때만 따라감).
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < 120) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  const isMine = (msg: ChatMessage) => msg.nickname === myNickname || msg.nickname === '나'

  const isActive = (row: number, col: number) =>
    activeCell?.row === row && activeCell?.col === col

  const cell = (row: number, col: number, className: string, style: React.CSSProperties | undefined, content: React.ReactNode) => (
    <div
      className={`xl-cell ${className} ${isActive(row, col) ? 'xl-cell-active' : ''}`}
      style={style}
      onClick={e => { e.stopPropagation(); onCellClick(row, col) }}
    >
      {content}
    </div>
  )

  return (
    <div className="xl-rows" ref={rowsRef}>

      {/* 행 1: 헤더 */}
      <div className="xl-row xl-row-header">
        <div className="xl-rownum xl-rownum-hdr" onClick={e => e.stopPropagation()} />
        {cell(1, 0, '',             { width: colWidths.A }, '날짜')}
        {cell(1, 1, '',             { width: colWidths.B }, '담당자')}
        {cell(1, 2, 'xl-cellflex', undefined,               '업무 내용')}
        {cell(1, 3, '',             { width: colWidths.D }, '원문 (비고)')}
        {cell(1, 4, '',             { width: colWidths.E }, '시간')}
      </div>

      {messages.length === 0 && (
        <div className="xl-row">
          <div className="xl-rownum">2</div>
          <div className="xl-cell" style={{width:56}}/>
          <div className="xl-cell xl-empty xl-cellflex">— 데이터 없음 —</div>
          <div className="xl-cell" style={{width:90}}/>
          <div className="xl-cell" style={{width:60}}/>
        </div>
      )}

      {messages.map((msg, i) => {
        const rowNum = i + 2
        return (
          <Row
            key={msg.id}
            msg={msg}
            mine={isMine(msg)}
            selected={selectedIds.has(msg.id)}
            rowNum={rowNum}
            activeCol={activeCell?.row === rowNum ? activeCell.col : null}
            today={today}
            colWidths={colWidths}
            onToggleSelect={onToggleSelect}
            onCellClick={onCellClick}
          />
        )
      })}
    </div>
  )
}

export default ChatPanel
