// 리본/타이틀바용 공용 아이콘 세트. 실제 Excel 아이콘을 그대로 복제하지 않고,
// Fluent 스타일(단색 라인 위주)로 단순화한 벡터를 사용해 이모지 대신 쓴다.
import React from 'react'

interface IconProps {
  size?: number
  className?: string
}

const svgBase = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const IconExcelLogo: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden="true">
    <rect x="1" y="1" width="18" height="18" rx="4" fill="#185c37" />
    <text x="10" y="14.5" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Segoe UI, sans-serif">X</text>
  </svg>
)

export const IconSave: React.FC<IconProps> = ({ size = 15, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M3 3h11l3 3v11H3z" />
    <rect x="6" y="3" width="6" height="4" />
    <rect x="6" y="12" width="8" height="5" />
  </svg>
)

export const IconUndo: React.FC<IconProps> = ({ size = 13, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M4 9h8a4 4 0 1 1 0 8h-3" />
    <path d="M7 5 3 9l4 4" />
  </svg>
)

export const IconRedo: React.FC<IconProps> = ({ size = 13, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M16 9H8a4 4 0 1 0 0 8h3" />
    <path d="M13 5l4 4-4 4" />
  </svg>
)

export const IconClipboardPaste: React.FC<IconProps> = ({ size = 26, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="4" y="3" width="12" height="15" rx="1" />
    <rect x="7" y="1.5" width="6" height="3" rx="1" />
    <path d="M6.5 9h7M6.5 12h7M6.5 15h4" />
  </svg>
)

export const IconScissors: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="5" cy="5" r="2" />
    <circle cx="5" cy="15" r="2" />
    <path d="M6.5 6.5 16 16M6.5 13.5 16 4" />
  </svg>
)

export const IconCopyDoc: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="3" y="6" width="10" height="11" rx="1" />
    <rect x="6.5" y="2.5" width="10" height="11" rx="1" fill="var(--xl-green-lt, #e2efda)" />
  </svg>
)

export const IconPalette: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M10 2a8 6 0 0 0 0 16c1.4 0 1.6-1.6.4-2.3-.9-.5-.3-1.9.8-1.9h1.6A4.2 4.2 0 0 0 17 9.6 7.9 7.9 0 0 0 10 2z" />
    <circle cx="6.5" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="8" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconBrush: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M15.5 2.5c1 1 1 2.3 0 3.3l-6 6a2.1 2.1 0 0 1-3.3-3.3l6-6c1-1 2.3-1 3.3 0z" />
    <path d="M8 11.5c-1 1-.7 1.8-.2 2.6.7 1.1-.1 2.4-1.3 2.4-.9 0-1.5-.5-1.9-1" />
  </svg>
)

export const IconThemeSlide: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" />
    <path d="M9.5 17.5V9.5h8" fill="var(--xl-green, #217346)" fillOpacity="0.4" stroke="none" />
  </svg>
)

export const IconColorSwatch: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden="true">
    <rect x="2.5" y="2.5" width="7" height="7" fill="#4472c4" />
    <rect x="10.5" y="2.5" width="7" height="7" fill="#ed7d31" />
    <rect x="2.5" y="10.5" width="7" height="7" fill="#a5a5a5" />
    <rect x="10.5" y="10.5" width="7" height="7" fill="#ffc000" />
  </svg>
)

export const IconPerson: React.FC<IconProps> = ({ size = 13, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="10" cy="6.5" r="3.5" />
    <path d="M3.5 17c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
  </svg>
)

export const IconTrash: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M4 6h12M8 6V4h4v2" />
    <path d="M5.5 6l.8 10.5a1 1 0 0 0 1 1h5.4a1 1 0 0 0 1-1L14.5 6" />
    <path d="M8.3 9v5M11.7 9v5" />
  </svg>
)

export const IconPivotTable: React.FC<IconProps> = ({ size = 22, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="3" y="3" width="14" height="14" rx="1" />
    <path d="M3 8h14M8 3v14" />
    <rect x="3" y="3" width="5" height="5" fill="var(--xl-green, #217346)" fillOpacity="0.35" stroke="none" />
  </svg>
)

export const IconBarChart: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M3 17V3M3 17h14" />
    <path d="M6 14v-4M10 14V7M14 14v-7" strokeWidth={2.2} />
  </svg>
)

export const IconLineChart: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M3 17V3M3 17h14" />
    <path d="M4.5 13 8 9l3 2.5 4.5-6" />
    <circle cx="15.5" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

export const IconPieChart: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="10" cy="10" r="7" />
    <path d="M10 3v7l6 2A7 7 0 0 0 10 3z" fill="var(--xl-green, #217346)" fillOpacity="0.35" />
  </svg>
)

export const IconPicture: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="3.5" width="15" height="13" rx="1" />
    <circle cx="7" cy="8" r="1.4" />
    <path d="M3 15l4.5-4.5L11 14l2.5-2.5L17 15" />
  </svg>
)

export const IconShape: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="8" cy="8" r="5" />
    <path d="M13 17l4.5-8H8.5z" />
  </svg>
)

export const IconMap: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M3 5l5-2 5 2 4-2v12l-4 2-5-2-5 2z" />
    <path d="M8 3v12M13 5v12" />
  </svg>
)

export const IconLink: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="7" width="7" height="6" rx="3" transform="rotate(-40 6 10)" />
    <rect x="10.5" y="7" width="7" height="6" rx="3" transform="rotate(-40 14 10)" />
  </svg>
)

export const IconTextBox: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="4" width="15" height="12" rx="1" strokeDasharray="2.5 2" />
    <path d="M7 8h6M8.5 8v5M9.5 13h-2" />
  </svg>
)

export const IconHeaderFooter: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1" />
    <path d="M2.5 6h15M2.5 14h15" />
  </svg>
)

export const IconRuler: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="7" width="15" height="6" rx="1" />
    <path d="M5.5 7v2.5M8.5 7v2.5M11.5 7v2.5M14.5 7v2.5" />
  </svg>
)

export const IconOrientation: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="5" y="2.5" width="10" height="14" rx="1" transform="rotate(20 10 10)" />
  </svg>
)

export const IconPrinter: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="4" y="7" width="12" height="7" rx="1" />
    <path d="M6 7V3h8v4M6 14v3h8v-3" />
  </svg>
)

export const IconClock: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6v4l3 2" />
  </svg>
)

export const IconCalendar: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="3" y="4" width="14" height="13" rx="1" />
    <path d="M3 8h14M6.5 2.5v3M13.5 2.5v3" />
  </svg>
)

export const IconMagnifier: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="M12.5 12.5 17 17" />
  </svg>
)

export const IconTag: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M3 4h7l7 7-7 7-7-7z" />
    <circle cx="6.3" cy="7.3" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconPin: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M10 2a4 4 0 0 1 4 4c0 3-4 5-4 12-0-7-4-9-4-12a4 4 0 0 1 4-4z" />
  </svg>
)

export const IconCalculator: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="4" y="2.5" width="12" height="15" rx="1" />
    <path d="M6 6h8" />
    <circle cx="6.7" cy="10" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="10" cy="10" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="13.3" cy="10" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="6.7" cy="13.5" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="10" cy="13.5" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="13.3" cy="13.5" r="0.7" fill="currentColor" stroke="none" />
  </svg>
)

export const IconPlug: React.FC<IconProps> = ({ size = 22, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M7 8V3M13 8V3" />
    <path d="M5 8h10v3a5 5 0 0 1-10 0z" />
    <path d="M10 16v2" />
  </svg>
)

export const IconGlobe: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="10" cy="10" r="7" />
    <ellipse cx="10" cy="10" rx="3" ry="7" />
    <path d="M3 10h14" />
  </svg>
)

export const IconNoEntry: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="10" cy="10" r="7" />
    <path d="M5.5 14.5l9-9" />
  </svg>
)

export const IconBook: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M10 5c-1.5-1.3-4-1.7-6.5-1v11.5c2.5-.7 5 -.3 6.5 1 1.5-1.3 4-1.7 6.5-1V4c-2.5-.7-5-.3-6.5 1z" />
    <path d="M10 5v11.5" />
  </svg>
)

export const IconSpeechBubble: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M3 4h14v9H8l-3 3v-3H3z" />
  </svg>
)

export const IconEye: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" />
    <circle cx="10" cy="10" r="2.3" />
  </svg>
)

export const IconLock: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="4.5" y="9" width="11" height="8" rx="1.2" />
    <path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3" />
  </svg>
)

export const IconPencil: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M12 4l4 4-9 9-4.5.5.5-4.5z" />
    <path d="M10.5 5.5l4 4" />
  </svg>
)

export const IconWindow: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="3" width="15" height="13" rx="1" />
    <path d="M2.5 6.5h15" />
  </svg>
)

export const IconArrangeAll: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="2.5" width="6.5" height="15" rx="1" />
    <rect x="11" y="2.5" width="6.5" height="15" rx="1" />
  </svg>
)

export const IconSplit: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1" />
    <path d="M2.5 10h15M10 2.5v15" />
  </svg>
)

export const IconFreezeGrid: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1" />
    <path d="M2.5 7h15M7 2.5v15" />
    <rect x="2.5" y="2.5" width="15" height="4.5" fill="var(--xl-green, #217346)" fillOpacity="0.3" stroke="none" />
  </svg>
)

export const IconWordArt: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M4 16 8.5 4h1L14 16M5.5 12h7" />
  </svg>
)

export const IconSparkle: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M10 2v5M10 13v5M2 10h5M13 10h5M4.5 4.5l3 3M12.5 12.5l3 3M15.5 4.5l-3 3M7.5 12.5l-3 3" />
  </svg>
)

export const IconChevronDown: React.FC<IconProps> = ({ size = 10, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <path d="M4 7l6 6 6-6" />
  </svg>
)

export const IconSearch: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="M12.5 12.5 17 17" />
  </svg>
)

export const IconShare: React.FC<IconProps> = ({ size = 13, className }) => (
  <svg width={size} height={size} {...svgBase} className={className} aria-hidden="true">
    <circle cx="15" cy="4.5" r="2" />
    <circle cx="15" cy="15.5" r="2" />
    <circle cx="4.5" cy="10" r="2" />
    <path d="M6.3 8.8 13 5.3M6.3 11.2l6.7 3.5" />
  </svg>
)
