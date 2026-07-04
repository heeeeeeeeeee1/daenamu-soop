const adjectives = [
  '성난', '지친', '억울한', '빡친', '열받은', '분노한',
  '피곤한', '답답한', '울고싶은', '황당한', '멍한',
  '무기력한', '지긋지긋한', '민감한', '예민한', '폭발직전인',
  '꾹참는', '한숨쉬는', '눈물날것같은', '웃긴',
]

const nouns = [
  '다람쥐', '대나무', '직장인', '사원', '인턴',
  '팀장', '개발자', '디자이너', '기획자', '영업사원',
  '경리', '비서', '과장', '대리', '주임',
  '신입', '알바생', '차장', '부장보좌', '팀원',
]

export function generateNickname(): string {
  const adj  = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj}${noun}`
}
