import React, { useMemo } from 'react'
import { ChatMessage } from './ChatPanel'

interface Props {
  messages: ChatMessage[]
  today: string
}

const MonthlySheet: React.FC<Props> = ({ messages, today }) => {
  const summary = useMemo(() => {
    const map: Record<string, { count: number; last: string; firstTs: number }> = {}
    for (const m of messages) {
      if (!map[m.nickname]) map[m.nickname] = { count: 0, last: '', firstTs: m.timestamp }
      map[m.nickname].count++
      map[m.nickname].last = m.text
    }
    return Object.entries(map).map(([nick, d]) => ({ nick, ...d }))
      .sort((a, b) => b.count - a.count)
  }, [messages])

  const total = summary.reduce((s, r) => s + r.count, 0)

  return (
    <div className="xl-rows">
      {/* 헤더 */}
      <div className="xl-row xl-row-header">
        <div className="xl-rownum">1</div>
        <div className="xl-cell" style={{width:40}}>No.</div>
        <div className="xl-cell" style={{width:80}}>날짜</div>
        <div className="xl-cell" style={{width:120}}>담당자</div>
        <div className="xl-cell" style={{width:60}}>처리 건수</div>
        <div className="xl-cell" style={{width:70}}>비중 (%)</div>
        <div className="xl-cell xl-cellflex">최근 업무 내용</div>
        <div className="xl-cell" style={{width:70}}>상태</div>
      </div>

      {summary.length === 0 && (
        <div className="xl-row">
          <div className="xl-rownum">2</div>
          <div className="xl-cell xl-empty xl-cellflex">— 데이터 없음 — 메시지를 입력하면 여기에 집계됩니다 —</div>
        </div>
      )}

      {summary.map((row, i) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0
        const pctBarWidth = Math.max(4, pct)
        return (
          <div key={row.nick} className={`xl-row ${i % 2 === 0 ? 'xl-row-stripe' : ''}`}>
            <div className="xl-rownum">{i + 2}</div>
            <div className="xl-cell" style={{width:40}}>{i + 1}</div>
            <div className="xl-cell xl-cell-date" style={{width:80}}>{today}</div>
            <div className="xl-cell xl-cell-nick" style={{width:120}}>{row.nick}</div>
            <div className="xl-cell xl-cell-num" style={{width:60}}>{row.count}</div>
            <div className="xl-cell" style={{width:70}}>
              <div className="xl-pct-bar">
                <div className="xl-pct-fill" style={{width: `${pctBarWidth}%`}} />
                <span className="xl-pct-label">{pct}%</span>
              </div>
            </div>
            <div className="xl-cell xl-cellflex xl-cell-wrap">
              <span className="xl-mono-text">{row.last.slice(0, 60)}</span>
            </div>
            <div className="xl-cell" style={{width:70}}>
              <span className={`xl-badge ${row.count >= 5 ? 'xl-badge-green' : 'xl-badge-blue'}`}>
                {row.count >= 5 ? '적극 참여' : '진행 중'}
              </span>
            </div>
          </div>
        )
      })}

      {/* 합계 행 */}
      {summary.length > 0 && (
        <div className="xl-row xl-row-total">
          <div className="xl-rownum">{summary.length + 2}</div>
          <div className="xl-cell" style={{width:40}}/>
          <div className="xl-cell" style={{width:80}}/>
          <div className="xl-cell xl-cell-total-label" style={{width:120}}>합계</div>
          <div className="xl-cell xl-cell-num xl-cell-total" style={{width:60}}>{total}</div>
          <div className="xl-cell" style={{width:70}}>
            <span className="xl-pct-label">100%</span>
          </div>
          <div className="xl-cell xl-cellflex"/>
          <div className="xl-cell" style={{width:70}}/>
        </div>
      )}
    </div>
  )
}

export default MonthlySheet
