// 카카오톡/슬랙 등 링크 공유 시 보여줄 미리보기 이미지(og:image) 생성 스크립트.
// 결과물(public/og-image.png)은 저장소에 커밋해두고, 디자인을 바꿀 때만 다시 실행한다.
// 실행: node scripts/generate-og-image.mjs  (devDependency로 sharp가 설치되어 있어야 함)
import sharp from 'sharp'
import { writeFileSync } from 'fs'

const WIDTH = 1200
const HEIGHT = 630
const FONT = "'Malgun Gothic', 'Segoe UI', sans-serif"

function bambooStalk(x, height, segments, opacity) {
  const segH = height / segments
  let rects = ''
  for (let i = 0; i < segments; i++) {
    rects += `<rect x="${x}" y="${HEIGHT - (i + 1) * segH}" width="34" height="${segH - 6}" rx="16" fill="#2f8f5b" opacity="${opacity}" />`
  }
  return rects
}

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#123822"/>
      <stop offset="100%" stop-color="#1e6b40"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  ${bambooStalk(40, 630, 6, 0.35)}
  ${bambooStalk(90, 500, 5, 0.22)}
  ${bambooStalk(WIDTH - 74, 630, 6, 0.35)}
  ${bambooStalk(WIDTH - 124, 480, 5, 0.22)}

  <text x="${WIDTH / 2}" y="205" font-family="${FONT}" font-size="88" font-weight="700" fill="#ffffff" text-anchor="middle">🎋 대나무숲</text>
  <text x="${WIDTH / 2}" y="255" font-family="${FONT}" font-size="26" fill="#cfe8d8" text-anchor="middle">회사에서 열받을 때, 실시간 익명 채팅</text>

  <rect x="230" y="320" width="740" height="200" rx="14" fill="#ffffff" opacity="0.08"/>
  <text x="${WIDTH / 2}" y="385" font-family="${FONT}" font-size="30" fill="#ffe1e1" text-anchor="middle">"X발 이 미친 프로젝트"</text>
  <text x="${WIDTH / 2}" y="430" font-family="${FONT}" font-size="26" fill="#cfe8d8" text-anchor="middle">↓</text>
  <text x="${WIDTH / 2}" y="480" font-family="${FONT}" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">"3분기 실적 달성을 위한 액션플랜 수립이 필요합니다."</text>

  <text x="${WIDTH / 2}" y="580" font-family="${FONT}" font-size="20" fill="#a8d4b8" text-anchor="middle">daenamu-soop.vercel.app</text>
</svg>`

const png = await sharp(Buffer.from(svg)).png().toBuffer()
writeFileSync(new URL('../public/og-image.png', import.meta.url), png)
console.log('public/og-image.png 생성 완료')
