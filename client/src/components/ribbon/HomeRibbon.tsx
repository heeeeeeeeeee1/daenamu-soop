interface Props {
  selectedIds: Set<string>
  deleteSelected: () => void
  clearAll: () => void
}

export function HomeRibbon({ selectedIds, deleteSelected, clearAll }: Props) {
  return <>
    <div className="xl-rgroup">
      <div className="xl-paste-big">📋<span>붙여넣기</span></div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">✂️ 잘라내기</button>
        <button className="xl-rbtn">📑 복사</button>
        <button className="xl-rbtn">🎨 서식 복사</button>
      </div>
      <span className="xl-rgroup-label">클립보드</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rfont-row">
        <select className="xl-rselect" style={{width:100}}><option>맑은 고딕</option><option>굴림</option></select>
        <select className="xl-rselect" style={{width:44}}><option>11</option><option>12</option><option>14</option></select>
        <button className="xl-ricobtn">A↑</button><button className="xl-ricobtn">A↓</button>
      </div>
      <div className="xl-rfont-row">
        <button className="xl-ricobtn xl-bold">B</button>
        <button className="xl-ricobtn xl-italic">I</button>
        <button className="xl-ricobtn xl-underline">U</button>
        <div className="xl-rsep-v"/>
        <button className="xl-ricobtn">⊞</button>
        <button className="xl-ricobtn">🎨</button>
        <button className="xl-ricobtn">A</button>
      </div>
      <span className="xl-rgroup-label">글꼴</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rfont-row">
        <button className="xl-ricobtn">≡←</button><button className="xl-ricobtn">≡</button><button className="xl-ricobtn">≡→</button>
        <div className="xl-rsep-v"/>
        <button className="xl-ricobtn">⤵</button><button className="xl-ricobtn">↔</button>
      </div>
      <div className="xl-rfont-row">
        <button className="xl-ricobtn">▁←</button><button className="xl-ricobtn">▁</button><button className="xl-ricobtn">▁→</button>
        <div className="xl-rsep-v"/>
        <button className="xl-ricobtn" style={{fontSize:'9px',width:36}}>병합▼</button>
      </div>
      <span className="xl-rgroup-label">맞춤</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rfont-row">
        <select className="xl-rselect" style={{width:110}}><option>일반</option><option>숫자</option><option>통화</option><option>회계</option></select>
      </div>
      <div className="xl-rfont-row">
        <button className="xl-ricobtn">%</button><button className="xl-ricobtn">,</button>
        <button className="xl-ricobtn">.0↑</button><button className="xl-ricobtn">.0↓</button>
      </div>
      <span className="xl-rgroup-label">표시 형식</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall">∑ 자동 합계</button>
      <button className="xl-rbtn-tall">↓ 채우기</button>
      <button
        className={`xl-rbtn-tall xl-delete-btn ${selectedIds.size > 0 ? 'active' : ''}`}
        onClick={e => { e.stopPropagation(); deleteSelected() }}
        title="선택한 행 삭제 (Delete)"
      >🗑 지우기{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}</button>
      <button
        className="xl-rbtn-tall xl-delete-btn"
        onClick={e => { e.stopPropagation(); clearAll() }}
        title="모든 메시지 삭제 (본인 화면에서만 사라짐)"
      >🗑️ 전체 삭제</button>
      <span className="xl-rgroup-label">편집</span>
    </div>
  </>
}
