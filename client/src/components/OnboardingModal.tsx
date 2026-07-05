interface Props {
  onDismiss: () => void
}

export function OnboardingModal({ onDismiss }: Props) {
  return (
    <div className="xl-modal-backdrop" onClick={onDismiss}>
      <div className="xl-modal" onClick={e => e.stopPropagation()}>
        <div className="xl-modal-titlebar">
          <span>📊 Microsoft Excel</span>
          <button className="xl-modal-close" onClick={onDismiss}>✕</button>
        </div>
        <div className="xl-modal-body">
          <div className="xl-modal-icon">⚠️</div>
          <div className="xl-modal-content">
            <p className="xl-modal-title">업무 관련 중요 공지</p>
            <p>이 문서는 <strong>대나무숲</strong>입니다.</p>
            <p>회사에서 하고 싶은 말을 수식 입력줄에 입력하고 Enter를 누르면,<br/>욕설 강도에 따라 <strong>업무 메시지</strong>로 자동 순화됩니다.</p>
            <p>욕설 강도에 따라 변환 수위가 달라집니다:</p>
            <ul>
              <li>🟢 욕 1~2개 → "일정 확인 부탁드립니다."</li>
              <li>🟡 욕 3~5개 → "오늘 EOD까지 공유드리겠습니다."</li>
              <li>🔴 욕 6개↑ → "크로스펑셔널 협업 강화 방안을..."</li>
            </ul>
            <p className="xl-modal-tip">💡 같은 서버에 접속한 사람들과 실시간으로 공유됩니다.<br/>원문은 <strong>* 마스킹</strong> 처리되며, 클릭하면 볼 수 있습니다.</p>
            <p className="xl-modal-sub">옆자리 팀장이 봐도 그냥 엑셀입니다. 아마도.</p>
          </div>
        </div>
        <div className="xl-modal-footer">
          <button className="xl-modal-btn" onClick={onDismiss}>확인</button>
        </div>
      </div>
    </div>
  )
}
