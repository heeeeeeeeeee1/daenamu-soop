import React, { useEffect, useRef, useState } from 'react'

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
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

const MaskedCell: React.FC<{ text: string }> = ({ text }) => {
  const [revealed, setRevealed] = useState(false)
  return (
    <span
      className={`xl-mask ${revealed ? 'xl-mask-on' : ''}`}
      onClick={e => { e.stopPropagation(); setRevealed(r => !r) }}
      title={revealed ? '클릭하여 숨기기' : '클릭하여 보기'}
    >
      {revealed ? text : '*'.repeat(text.length)}
    </span>
  )
}

const ChatPanel: React.FC<Props> = ({
  messages, myNickname, today, selectedIds, onToggleSelect, activeCell, onCellClick,
}) => {
  const rowsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rowsRef.current
    if (el) el.scrollTop = el.scrollHeight
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
        {cell(1, 0, '',             { width: 56 },  '날짜')}
        {cell(1, 1, '',             { width: 110 }, '담당자')}
        {cell(1, 2, 'xl-cellflex', undefined,        '업무 내용')}
        {cell(1, 3, '',             { width: 90 },  '원문 (비고)')}
        {cell(1, 4, '',             { width: 60 },  '시간')}
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
        const mine     = isMine(msg)
        const selected = selectedIds.has(msg.id)
        const rowNum   = i + 2
        const rowActive = activeCell?.row === rowNum

        return (
          <div
            key={msg.id}
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
                selected  ? 'xl-rownum-sel' : '',
                rowActive && !selected ? 'xl-rownum-active' : '',
              ].join(' ')}
              onClick={e => { e.stopPropagation(); onToggleSelect(msg.id, e.ctrlKey || e.metaKey) }}
              title="클릭: 행 선택 (Delete로 삭제)"
            >
              {selected ? '▶' : rowNum}
            </div>

            {cell(rowNum, 0, 'xl-cell-date', { width: 56 },  today)}
            {cell(rowNum, 1, 'xl-cell-nick', { width: 110 }, msg.nickname)}
            {cell(rowNum, 2, 'xl-cellflex',  undefined,       msg.text)}
            {cell(rowNum, 3, 'xl-cell-orig', { width: 90 },
              mine && msg.original ? <MaskedCell text={msg.original} /> : null
            )}
            {cell(rowNum, 4, 'xl-cell-time', { width: 60 }, formatTime(msg.timestamp))}
          </div>
        )
      })}
    </div>
  )
}

export default ChatPanel
