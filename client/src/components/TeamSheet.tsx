import React, { useMemo } from 'react'
import { ChatMessage } from './ChatPanel'

interface Props {
  messages: ChatMessage[]
  today: string
}

// server/src/nickname.ts의 명사 목록과 동일 (서버/클라이언트가 별도 패키지라 직접 import 불가).
// 긴 명사부터 매칭해야 '영업사원'이 '사원'으로 잘못 잡히는 걸 막을 수 있다.
const NICKNAME_NOUNS = [
  '다람쥐', '대나무', '직장인', '사원', '인턴',
  '팀장', '개발자', '디자이너', '기획자', '영업사원',
  '경리', '비서', '과장', '대리', '주임',
  '신입', '알바생', '차장', '부장보좌', '팀원',
].sort((a, b) => b.length - a.length)

// 명사별 가짜 "목표" 수치 — 실적(실제 채팅 데이터)과 대비시켜 달성률을 보여주기 위한 위장용 값
const TEAM_GOALS: Record<string, number> = {
  '다람쥐': 8, '대나무': 8, '직장인': 15, '사원': 12, '인턴': 6,
  '팀장': 10, '개발자': 15, '디자이너': 12, '기획자': 12, '영업사원': 18,
  '경리': 8, '비서': 8, '과장': 10, '대리': 12, '주임': 10,
  '신입': 8, '알바생': 6, '차장': 8, '부장보좌': 6, '팀원': 12,
}
const DEFAULT_GOAL = 10

function findNoun(nickname: string): string | null {
  return NICKNAME_NOUNS.find(n => nickname.endsWith(n)) ?? null
}

function achieveRate(actual: number, goal: number) {
  return goal > 0 ? Math.round((actual / goal) * 100) : 0
}

function statusLabel(rate: number): { label: string; cls: string } {
  if (rate >= 100) return { label: '초과달성', cls: 'xl-badge-green' }
  if (rate >= 80)  return { label: '진행중',   cls: 'xl-badge-blue' }
  return               { label: '미달',       cls: 'xl-badge-red' }
}

const TeamSheet: React.FC<Props> = ({ messages, today }) => {
  const summary = useMemo(() => {
    const map: Record<string, { actual: number; last: string; byNick: Record<string, number> }> = {}
    for (const m of messages) {
      const noun = findNoun(m.nickname)
      if (!noun) continue
      const entry = map[noun] ?? (map[noun] = { actual: 0, last: '', byNick: {} })
      entry.actual++
      entry.last = m.text
      entry.byNick[m.nickname] = (entry.byNick[m.nickname] ?? 0) + 1
    }
    return Object.entries(map)
      .map(([noun, d]) => {
        const lead = Object.entries(d.byNick).sort((a, b) => b[1] - a[1])[0]?.[0] ?? noun
        return { noun, lead, actual: d.actual, last: d.last, goal: TEAM_GOALS[noun] ?? DEFAULT_GOAL }
      })
      .sort((a, b) => b.actual - a.actual)
  }, [messages])

  const totalGoal   = summary.reduce((s, r) => s + r.goal,   0)
  const totalActual = summary.reduce((s, r) => s + r.actual, 0)
  const totalRate   = achieveRate(totalActual, totalGoal)

  return (
    <div className="xl-rows">
      {/* 헤더 */}
      <div className="xl-row xl-row-header">
        <div className="xl-rownum">1</div>
        <div className="xl-cell" style={{width:100}}>팀명</div>
        <div className="xl-cell" style={{width:90}}>팀장</div>
        <div className="xl-cell" style={{width:70}}>목표</div>
        <div className="xl-cell" style={{width:70}}>실적</div>
        <div className="xl-cell" style={{width:80}}>달성률</div>
        <div className="xl-cell" style={{width:80}}>마감일</div>
        <div className="xl-cell xl-cellflex">비고</div>
        <div className="xl-cell" style={{width:80}}>상태</div>
      </div>

      {summary.length === 0 && (
        <div className="xl-row">
          <div className="xl-rownum">2</div>
          <div className="xl-cell xl-empty xl-cellflex">— 데이터 없음 — 메시지를 입력하면 여기에 집계됩니다 —</div>
        </div>
      )}

      {summary.map((row, i) => {
        const rate = achieveRate(row.actual, row.goal)
        const { label, cls } = statusLabel(rate)
        const barWidth = Math.min(100, rate)
        return (
          <div key={row.noun} className={`xl-row ${i % 2 === 0 ? 'xl-row-stripe' : ''}`}>
            <div className="xl-rownum">{i + 2}</div>
            <div className="xl-cell xl-cell-nick" style={{width:100}}>{row.noun}</div>
            <div className="xl-cell" style={{width:90, color:'#555'}}>{row.lead}</div>
            <div className="xl-cell xl-cell-num" style={{width:70}}>{row.goal.toLocaleString()}건</div>
            <div className="xl-cell xl-cell-num" style={{width:70}}>{row.actual.toLocaleString()}건</div>
            <div className="xl-cell" style={{width:80}}>
              <div className="xl-pct-bar">
                <div
                  className={`xl-pct-fill ${rate >= 100 ? 'xl-pct-fill-green' : rate < 80 ? 'xl-pct-fill-red' : ''}`}
                  style={{width: `${barWidth}%`}}
                />
                <span className="xl-pct-label">{rate}%</span>
              </div>
            </div>
            <div className="xl-cell xl-cell-date" style={{width:80}}>{today}</div>
            <div className="xl-cell xl-cellflex xl-cell-wrap" style={{color:'#555', fontSize:11}}>{row.last.slice(0, 60)}</div>
            <div className="xl-cell" style={{width:80}}>
              <span className={`xl-badge ${cls}`}>{label}</span>
            </div>
          </div>
        )
      })}

      {/* 합계 */}
      {summary.length > 0 && (
        <div className="xl-row xl-row-total">
          <div className="xl-rownum">{summary.length + 2}</div>
          <div className="xl-cell xl-cell-total-label" style={{width:100}}>전체 합계</div>
          <div className="xl-cell" style={{width:90}}/>
          <div className="xl-cell xl-cell-num xl-cell-total" style={{width:70}}>{totalGoal.toLocaleString()}건</div>
          <div className="xl-cell xl-cell-num xl-cell-total" style={{width:70}}>{totalActual.toLocaleString()}건</div>
          <div className="xl-cell" style={{width:80}}>
            <div className="xl-pct-bar">
              <div className="xl-pct-fill" style={{width: `${Math.min(100,totalRate)}%`}} />
              <span className="xl-pct-label">{totalRate}%</span>
            </div>
          </div>
          <div className="xl-cell" style={{width:80}}/>
          <div className="xl-cell xl-cellflex"/>
          <div className="xl-cell" style={{width:80}}/>
        </div>
      )}
    </div>
  )
}

export default TeamSheet
