interface Props {
  seconds: number
}

function getWakeMessage(seconds: number): string {
  if (seconds < 10) return '서버 연결 중...'
  if (seconds < 20) return '서버가 자고 있었나봐요. 깨우는 중... (무료 서버의 애환)'
  return `${seconds}초째 기다리는 중... 서버가 숙면 중입니다. 조금만요.`
}

export function WakeBanner({ seconds }: Props) {
  return (
    <div className="xl-wakebanner">
      <span className="xl-wake-spin">⏳</span>
      <span>{getWakeMessage(seconds)}</span>
    </div>
  )
}
