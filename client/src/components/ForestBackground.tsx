import React from 'react'

interface StalkConfig {
  x: number
  height: number
  segments: number
  thickness: number
  delay: number
  opacity: number
  hue: number
}

const stalks: StalkConfig[] = [
  { x: 60,   height: 580, segments: 8,  thickness: 14, delay: 0.0, opacity: 0.55, hue: 120 },
  { x: 145,  height: 680, segments: 9,  thickness: 18, delay: 0.5, opacity: 0.85, hue: 125 },
  { x: 230,  height: 530, segments: 7,  thickness: 12, delay: 1.1, opacity: 0.50, hue: 118 },
  { x: 330,  height: 720, segments: 10, thickness: 20, delay: 0.3, opacity: 1.00, hue: 122 },
  { x: 440,  height: 640, segments: 9,  thickness: 16, delay: 0.8, opacity: 0.70, hue: 126 },
  { x: 560,  height: 750, segments: 10, thickness: 22, delay: 0.1, opacity: 0.90, hue: 120 },
  { x: 670,  height: 600, segments: 8,  thickness: 14, delay: 1.3, opacity: 0.60, hue: 124 },
  { x: 760,  height: 700, segments: 9,  thickness: 18, delay: 0.6, opacity: 0.95, hue: 119 },
  { x: 860,  height: 660, segments: 9,  thickness: 16, delay: 0.4, opacity: 0.75, hue: 123 },
  { x: 960,  height: 570, segments: 8,  thickness: 12, delay: 1.0, opacity: 0.55, hue: 121 },
  { x: 1060, height: 710, segments: 10, thickness: 20, delay: 0.7, opacity: 0.88, hue: 125 },
  { x: 1150, height: 620, segments: 8,  thickness: 14, delay: 0.2, opacity: 0.65, hue: 118 },
]

interface LeafProps { x: number; y: number; side: 'left' | 'right'; size: number }

const Leaf: React.FC<LeafProps> = ({ x, y, side, size }) => {
  const angle = side === 'left' ? -35 : 35
  const lx = side === 'left' ? x - size * 1.4 : x + size * 1.4
  return (
    <ellipse
      cx={lx}
      cy={y}
      rx={size}
      ry={size * 0.22}
      fill={`hsl(122, 48%, 30%)`}
      transform={`rotate(${angle}, ${lx}, ${y})`}
      opacity={0.85}
    />
  )
}

interface StalkProps extends StalkConfig { baseY: number }

const BambooStalk: React.FC<StalkProps> = ({ x, baseY, height, segments, thickness, delay, opacity, hue }) => {
  const segH = height / segments
  return (
    <g
      opacity={opacity}
      style={{
        animation: `sway ${2.8 + delay * 0.3}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transformBox: 'fill-box',
        transformOrigin: 'bottom center',
      }}
    >
      {Array.from({ length: segments }, (_, i) => {
        const y = baseY - (i + 1) * segH
        const lightness = 22 + i * 2
        return (
          <g key={i}>
            <rect
              x={x - thickness / 2}
              y={y}
              width={thickness}
              height={segH - 5}
              fill={`hsl(${hue}, 42%, ${lightness}%)`}
              rx={thickness * 0.25}
            />
            <rect
              x={x - thickness / 2 - 1}
              y={y + segH - 7}
              width={thickness + 2}
              height={7}
              fill={`hsl(${hue}, 35%, 14%)`}
              rx={2}
            />
          </g>
        )
      })}
      {[0, 1, 2].map(i => {
        const leafY = baseY - (segments - i - 0.5) * segH
        const sz = thickness * 1.6 - i * 2
        return (
          <g key={`leaf-${i}`}>
            <Leaf x={x} y={leafY} side="left"  size={sz} />
            <Leaf x={x} y={leafY - segH * 0.35} side="right" size={sz * 0.85} />
          </g>
        )
      })}
    </g>
  )
}

const ForestBackground: React.FC = () => {
  const W = 1200
  const H = 800
  return (
    <div className="forest-bg">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        className="forest-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#060f07" />
            <stop offset="60%"  stopColor="#0c1f0e" />
            <stop offset="100%" stopColor="#0f2710" />
          </linearGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#3aff5a" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#3aff5a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#skyGrad)" />
        <rect width={W} height={H} fill="url(#glowGrad)" />

        {stalks.map((s, i) => (
          <BambooStalk key={i} {...s} baseY={H - 20} />
        ))}

        <rect x="0" y={H - 22} width={W} height={22} fill="#060f07" />
      </svg>
    </div>
  )
}

export default ForestBackground
