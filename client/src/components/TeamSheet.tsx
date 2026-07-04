import React from 'react'

interface KpiRow {
  team: string
  lead: string
  goal: number
  actual: number
  unit: string
  deadline: string
  note: string
}

const ROWS: KpiRow[] = [
  { team: '영업 1팀', lead: '박팀장',   goal: 120, actual: 108, unit: '건',  deadline: '07/31', note: '월말 집중 공략 필요' },
  { team: '영업 2팀', lead: '최팀장',   goal: 100, actual: 104, unit: '건',  deadline: '07/31', note: '목표 초과 달성 중' },
  { team: '개발팀',   lead: '김팀장',   goal: 30,  actual: 27,  unit: '건',  deadline: '08/15', note: 'QA 일정 조율 중' },
  { team: '마케팅팀', lead: '이팀장',   goal: 50,  actual: 43,  unit: '건',  deadline: '07/31', note: 'SNS 캠페인 진행 중' },
  { team: '인사팀',   lead: '정팀장',   goal: 15,  actual: 15,  unit: '건',  deadline: '07/15', note: '완료' },
  { team: 'CS팀',     lead: '한팀장',   goal: 200, actual: 187, unit: '건',  deadline: '07/31', note: '콜 처리율 93.5%' },
  { team: '기획팀',   lead: '장팀장',   goal: 8,   actual: 6,   unit: '건',  deadline: '08/31', note: '보고서 작성 중' },
]

function achieveRate(actual: number, goal: number) {
  return Math.round((actual / goal) * 100)
}

function statusLabel(rate: number): { label: string; cls: string } {
  if (rate >= 100) return { label: '초과달성', cls: 'xl-badge-green' }
  if (rate >= 80)  return { label: '진행중',   cls: 'xl-badge-blue' }
  return               { label: '미달',       cls: 'xl-badge-red' }
}

const TeamSheet: React.FC = () => {
  const totalGoal   = ROWS.reduce((s, r) => s + r.goal,   0)
  const totalActual = ROWS.reduce((s, r) => s + r.actual, 0)
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

      {ROWS.map((row, i) => {
        const rate = achieveRate(row.actual, row.goal)
        const { label, cls } = statusLabel(rate)
        const barWidth = Math.min(100, rate)
        return (
          <div key={row.team} className={`xl-row ${i % 2 === 0 ? 'xl-row-stripe' : ''}`}>
            <div className="xl-rownum">{i + 2}</div>
            <div className="xl-cell xl-cell-nick" style={{width:100}}>{row.team}</div>
            <div className="xl-cell" style={{width:90, color:'#555'}}>{row.lead}</div>
            <div className="xl-cell xl-cell-num" style={{width:70}}>{row.goal.toLocaleString()}{row.unit}</div>
            <div className="xl-cell xl-cell-num" style={{width:70}}>{row.actual.toLocaleString()}{row.unit}</div>
            <div className="xl-cell" style={{width:80}}>
              <div className="xl-pct-bar">
                <div
                  className={`xl-pct-fill ${rate >= 100 ? 'xl-pct-fill-green' : rate < 80 ? 'xl-pct-fill-red' : ''}`}
                  style={{width: `${barWidth}%`}}
                />
                <span className="xl-pct-label">{rate}%</span>
              </div>
            </div>
            <div className="xl-cell xl-cell-date" style={{width:80}}>{row.deadline}</div>
            <div className="xl-cell xl-cellflex" style={{color:'#555', fontSize:11}}>{row.note}</div>
            <div className="xl-cell" style={{width:80}}>
              <span className={`xl-badge ${cls}`}>{label}</span>
            </div>
          </div>
        )
      })}

      {/* 합계 */}
      <div className="xl-row xl-row-total">
        <div className="xl-rownum">{ROWS.length + 2}</div>
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
    </div>
  )
}

export default TeamSheet
