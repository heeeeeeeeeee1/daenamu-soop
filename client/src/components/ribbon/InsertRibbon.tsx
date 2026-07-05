export function InsertRibbon() {
  return <>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:52}}>📊<br/><span style={{fontSize:9}}>피벗 테이블</span></button>
      <button className="xl-rbtn-tall" style={{width:44}}>⊞<br/><span style={{fontSize:9}}>표</span></button>
      <span className="xl-rgroup-label">표</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rfont-row">
        <button className="xl-rbtn-icon">📈<br/><span style={{fontSize:8}}>세로 막대</span></button>
        <button className="xl-rbtn-icon">📉<br/><span style={{fontSize:8}}>꺾은 선</span></button>
        <button className="xl-rbtn-icon">🥧<br/><span style={{fontSize:8}}>원형</span></button>
        <button className="xl-rbtn-icon">▦<br/><span style={{fontSize:8}}>가로 막대</span></button>
        <button className="xl-rbtn-icon">⋯<br/><span style={{fontSize:8}}>더보기</span></button>
      </div>
      <span className="xl-rgroup-label">차트</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:44}}>🖼️<br/><span style={{fontSize:9}}>그림</span></button>
      <button className="xl-rbtn-tall" style={{width:44}}>🔷<br/><span style={{fontSize:9}}>도형</span></button>
      <button className="xl-rbtn-tall" style={{width:44}}>🗺️<br/><span style={{fontSize:9}}>지도</span></button>
      <span className="xl-rgroup-label">일러스트레이션</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:44}}>🔗<br/><span style={{fontSize:9}}>링크</span></button>
      <span className="xl-rgroup-label">링크</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rfont-row" style={{gap:2}}>
        <button className="xl-rbtn">🗒 텍스트 상자</button>
      </div>
      <div className="xl-rfont-row" style={{gap:2}}>
        <button className="xl-rbtn">📝 머리글/바닥글</button>
      </div>
      <div className="xl-rfont-row" style={{gap:2}}>
        <button className="xl-rbtn">✍ WordArt</button>
      </div>
      <span className="xl-rgroup-label">텍스트</span>
    </div>
  </>
}
