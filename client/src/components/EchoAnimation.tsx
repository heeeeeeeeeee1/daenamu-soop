import React, { useEffect, useState } from 'react'

interface Props {
  original: string
  transformed: string
  onEnd: () => void
}

const EchoAnimation: React.FC<Props> = ({ original, transformed, onEnd }) => {
  const [phase, setPhase] = useState<'original' | 'transform' | 'echo'>('original')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('transform'), 600)
    const t2 = setTimeout(() => setPhase('echo'), 1400)
    const t3 = setTimeout(() => onEnd(), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onEnd])

  return (
    <div className="echo-overlay">
      {phase === 'original' && (
        <div className="echo-original">
          <p className="echo-original-text">{original}</p>
        </div>
      )}

      {phase === 'transform' && (
        <div className="echo-transform">
          <p className="echo-arrow">↓ 순화 중...</p>
        </div>
      )}

      {phase === 'echo' && (
        <div className="echo-rings">
          <p className="echo-ring echo-ring-1">{transformed}</p>
          <p className="echo-ring echo-ring-2">{transformed}</p>
          <p className="echo-ring echo-ring-3">{transformed}</p>
        </div>
      )}
    </div>
  )
}

export default EchoAnimation
