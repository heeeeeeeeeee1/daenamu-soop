export function LayoutRibbon() {
  return <>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:52}}>🎨<br/><span style={{fontSize:9}}>테마</span></button>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🎨 색</button>
        <button className="xl-rbtn">🔤 글꼴</button>
        <button className="xl-rbtn">✨ 효과</button>
      </div>
      <span className="xl-rgroup-label">테마</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">📏 여백</button>
        <button className="xl-rbtn">📐 용지 방향</button>
        <button className="xl-rbtn">📄 크기</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🖨 인쇄 영역</button>
        <button className="xl-rbtn">↔ 나누기</button>
        <button className="xl-rbtn">🌄 배경</button>
      </div>
      <span className="xl-rgroup-label">페이지 설정</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div style={{fontSize:10, color:'#555', paddingBottom:2}}>눈금선</div>
      <div className="xl-rfont-row" style={{gap:4}}>
        <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 보기</label>
        <label className="xl-chklabel"><input type="checkbox"/> 인쇄</label>
      </div>
      <div style={{fontSize:10, color:'#555', paddingTop:4, paddingBottom:2}}>제목</div>
      <div className="xl-rfont-row" style={{gap:4}}>
        <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 보기</label>
        <label className="xl-chklabel"><input type="checkbox"/> 인쇄</label>
      </div>
      <span className="xl-rgroup-label">시트 옵션</span>
    </div>
  </>
}
