export function ReviewRibbon() {
  return <>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">✅ 맞춤법 검사</button>
        <button className="xl-rbtn">📖 유의어 사전</button>
        <button className="xl-rbtn">📊 통합 문서 통계</button>
      </div>
      <span className="xl-rgroup-label">언어 교정</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:52}}>🌐<br/><span style={{fontSize:9}}>번역</span></button>
      <span className="xl-rgroup-label">언어</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">💬 새 메모</button>
        <button className="xl-rbtn">🗑 삭제</button>
        <button className="xl-rbtn">◀ 이전</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">▶ 다음</button>
        <button className="xl-rbtn">👁 모두 표시</button>
      </div>
      <span className="xl-rgroup-label">메모</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🔒 시트 보호</button>
        <button className="xl-rbtn">🔒 통합 문서 보호</button>
        <button className="xl-rbtn">✏ 범위 편집 허용</button>
      </div>
      <span className="xl-rgroup-label">보호</span>
    </div>
  </>
}
