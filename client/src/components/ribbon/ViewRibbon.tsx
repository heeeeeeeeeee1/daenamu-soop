export function ViewRibbon() {
  return <>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn xl-rbtn-checked">📋 기본 보기</button>
        <button className="xl-rbtn">📄 페이지 나누기 미리 보기</button>
        <button className="xl-rbtn">📐 페이지 레이아웃</button>
      </div>
      <span className="xl-rgroup-label">통합 문서 보기</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <label className="xl-chklabel"><input type="checkbox"/> 눈금자</label>
      <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 눈금선</label>
      <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 수식 입력줄</label>
      <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 제목</label>
      <span className="xl-rgroup-label">표시</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:44}}>🔍<br/><span style={{fontSize:9}}>확대/축소</span></button>
      <button className="xl-rbtn-tall" style={{width:44}}>100%<br/><span style={{fontSize:9}}>100%</span></button>
      <span className="xl-rgroup-label">확대/축소</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">⬜ 새 창</button>
        <button className="xl-rbtn">⊞ 모두 정렬</button>
        <button className="xl-rbtn">❄ 틀 고정▼</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">✕ 분할</button>
        <button className="xl-rbtn">👁 숨기기</button>
        <button className="xl-rbtn">👁 숨기기 취소</button>
      </div>
      <span className="xl-rgroup-label">창</span>
    </div>
  </>
}
