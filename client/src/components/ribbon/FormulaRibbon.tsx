export function FormulaRibbon() {
  return <>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:60}}>ƒx<br/><span style={{fontSize:9}}>함수 삽입</span></button>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">∑ 자동 합계▼</button>
        <button className="xl-rbtn">🕐 최근에 사용</button>
        <button className="xl-rbtn">💹 재무</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">📋 논리</button>
        <button className="xl-rbtn">📝 텍스트</button>
        <button className="xl-rbtn">📅 날짜/시간</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🔍 찾기/참조</button>
        <button className="xl-rbtn">🧮 수학/삼각</button>
        <button className="xl-rbtn">⋯ 추가 함수</button>
      </div>
      <span className="xl-rgroup-label">함수 라이브러리</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">📛 이름 관리자</button>
        <button className="xl-rbtn">🏷 이름 정의</button>
        <button className="xl-rbtn">📌 수식에서 사용</button>
      </div>
      <span className="xl-rgroup-label">정의된 이름</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">↗ 참조 셀 추적</button>
        <button className="xl-rbtn">↙ 종속 셀 추적</button>
        <button className="xl-rbtn">✕ 화살표 제거</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🔬 수식 표시</button>
        <button className="xl-rbtn">⚠ 오류 검사</button>
        <button className="xl-rbtn">🔎 수식 계산</button>
      </div>
      <span className="xl-rgroup-label">수식 분석</span>
    </div>
  </>
}
