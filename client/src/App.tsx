import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import ShoutInput from './components/ShoutInput'
import ChatPanel, { ChatMessage } from './components/ChatPanel'
import MonthlySheet from './components/MonthlySheet'
import TeamSheet from './components/TeamSheet'
import { transform, curseLevel } from './lib/transformDictionary'
import { socket } from './lib/socket'
import { initSound, setWindVolume, playShout } from './lib/sound'
import './index.css'

const TODAY = new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', '')
const COL_LETTERS = ['A', 'B', 'C', 'D', 'E']

type CellAddr  = { row: number; col: number }
type Sheet     = 'main' | 'monthly' | 'team'
type RibbonTab = 'home' | 'insert' | 'layout' | 'formula' | 'data' | 'review' | 'view'
type SortMode  = 'time' | 'nick-asc' | 'nick-desc'
export type ColWidths = { A: number; B: number; D: number; E: number }

function cellName(c: CellAddr) { return `${COL_LETTERS[c.col]}${c.row}` }

function getCellText(msgs: ChatMessage[], cell: CellAddr, today: string): string {
  if (cell.row === 1) return ['날짜','담당자','업무 내용','원문 (비고)','시간'][cell.col] ?? ''
  const msg = msgs[cell.row - 2]
  if (!msg) return ''
  switch (cell.col) {
    case 0: return today
    case 1: return msg.nickname
    case 2: return msg.text
    case 3: return '(비공개)'
    case 4: return new Date(msg.timestamp).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false})
    default: return ''
  }
}

// ── 리본 탭별 버튼 구성 ────────────────────────────────────────
function HomeRibbon({ selectedIds, deleteSelected }: { selectedIds: Set<string>; deleteSelected: () => void }) {
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
      <span className="xl-rgroup-label">편집</span>
    </div>
  </>
}

function InsertRibbon() {
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

function LayoutRibbon() {
  return <>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:52}}>🎨<br/><span style={{fontSize:9}}>테마</span></button>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🎨 색</button>
        <button className="xl-rbtn">🔤 글꼴</button>
        <button className="xl-rbtn">✨ 효과</button>
      </div>
      <span className="xl-rgroup-label">테마</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">📏 여백</button>
        <button className="xl-rbtn">📐 용지 방향</button>
        <button className="xl-rbtn">📄 크기</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🖨 인쇄 영역</button>
        <button className="xl-rbtn">↔ 나누기</button>
        <button className="xl-rbtn">🌄 배경</button>
      </div>
      <span className="xl-rgroup-label">페이지 설정</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div style={{fontSize:10, color:'#555', paddingBottom:2}}>눈금선</div>
      <div className="xl-rfont-row" style={{gap:4}}>
        <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 보기</label>
        <label className="xl-chklabel"><input type="checkbox"/> 인쇄</label>
      </div>
      <div style={{fontSize:10, color:'#555', paddingTop:4, paddingBottom:2}}>제목</div>
      <div className="xl-rfont-row" style={{gap:4}}>
        <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 보기</label>
        <label className="xl-chklabel"><input type="checkbox"/> 인쇄</label>
      </div>
      <span className="xl-rgroup-label">시트 옵션</span>
    </div>
  </>
}

function FormulaRibbon() {
  return <>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:60}}>ƒx<br/><span style={{fontSize:9}}>함수 삽입</span></button>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">∑ 자동 합계▼</button>
        <button className="xl-rbtn">🕐 최근에 사용</button>
        <button className="xl-rbtn">💹 재무</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">📋 논리</button>
        <button className="xl-rbtn">📝 텍스트</button>
        <button className="xl-rbtn">📅 날짜/시간</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🔍 찾기/참조</button>
        <button className="xl-rbtn">🧮 수학/삼각</button>
        <button className="xl-rbtn">⋯ 추가 함수</button>
      </div>
      <span className="xl-rgroup-label">함수 라이브러리</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">📛 이름 관리자</button>
        <button className="xl-rbtn">🏷 이름 정의</button>
        <button className="xl-rbtn">📌 수식에서 사용</button>
      </div>
      <span className="xl-rgroup-label">정의된 이름</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">↗ 참조 셀 추적</button>
        <button className="xl-rbtn">↙ 종속 셀 추적</button>
        <button className="xl-rbtn">✕ 화살표 제거</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">🔬 수식 표시</button>
        <button className="xl-rbtn">⚠ 오류 검사</button>
        <button className="xl-rbtn">🔎 수식 계산</button>
      </div>
      <span className="xl-rgroup-label">수식 분석</span>
    </div>
  </>
}

function DataRibbon({ sortMode, onSort, filterMine, onFilterToggle }:
  { sortMode: SortMode; onSort: (m: SortMode) => void; filterMine: boolean; onFilterToggle: () => void }) {
  return <>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:54}}>🔌<br/><span style={{fontSize:9}}>데이터 가져오기</span></button>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">📄 텍스트/CSV</button>
        <button className="xl-rbtn">🌐 웹</button>
        <button className="xl-rbtn">⊞ 표/범위</button>
      </div>
      <span className="xl-rgroup-label">데이터 가져오기</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <button
        className={`xl-rbtn-tall ${sortMode==='nick-asc' ? 'xl-rbtn-active' : ''}`}
        onClick={e => { e.stopPropagation(); onSort(sortMode==='nick-asc' ? 'time' : 'nick-asc') }}
        title="담당자 이름 오름차순 정렬"
      >A↑Z<br/><span style={{fontSize:9}}>오름차순</span></button>
      <button
        className={`xl-rbtn-tall ${sortMode==='nick-desc' ? 'xl-rbtn-active' : ''}`}
        onClick={e => { e.stopPropagation(); onSort(sortMode==='nick-desc' ? 'time' : 'nick-desc') }}
        title="담당자 이름 내림차순 정렬"
      >Z↓A<br/><span style={{fontSize:9}}>내림차순</span></button>
      <button
        className={`xl-rbtn-tall ${filterMine ? 'xl-rbtn-active' : ''}`}
        onClick={e => { e.stopPropagation(); onFilterToggle() }}
        title="내 메시지만 보기"
      >▾<br/><span style={{fontSize:9}}>{filterMine ? '필터 해제' : '내 것만'}</span></button>
      <span className="xl-rgroup-label">정렬 및 필터</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">📐 텍스트 나누기</button>
        <button className="xl-rbtn">⚡ 빠른 채우기</button>
        <button className="xl-rbtn">🚫 중복 제거</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">✅ 데이터 유효성</button>
        <button className="xl-rbtn">🔗 통합</button>
        <button className="xl-rbtn">📊 가상 분석</button>
      </div>
      <span className="xl-rgroup-label">데이터 도구</span>
    </div>
  </>
}

function ReviewRibbon() {
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

function ViewRibbon() {
  return <>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn xl-rbtn-checked">📋 기본 보기</button>
        <button className="xl-rbtn">📄 페이지 나누기 미리 보기</button>
        <button className="xl-rbtn">📐 페이지 레이아웃</button>
      </div>
      <span className="xl-rgroup-label">통합 문서 보기</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <label className="xl-chklabel"><input type="checkbox"/> 눈금자</label>
      <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 눈금선</label>
      <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 수식 입력줄</label>
      <label className="xl-chklabel"><input type="checkbox" defaultChecked/> 제목</label>
      <span className="xl-rgroup-label">표시</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:44}}>🔍<br/><span style={{fontSize:9}}>확대/축소</span></button>
      <button className="xl-rbtn-tall" style={{width:44}}>100%<br/><span style={{fontSize:9}}>100%</span></button>
      <span className="xl-rgroup-label">확대/축소</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">⬜ 새 창</button>
        <button className="xl-rbtn">⊞ 모두 정렬</button>
        <button className="xl-rbtn">❄ 틀 고정▼</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">✕ 분할</button>
        <button className="xl-rbtn">👁 숨기기</button>
        <button className="xl-rbtn">👁 숨기기 취소</button>
      </div>
      <span className="xl-rgroup-label">창</span>
    </div>
  </>
}

// ─────────────────────────────────────────────────────────────
function App() {
  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeCell, setActiveCell]   = useState<CellAddr | null>(null)
  const [userCount, setUserCount]     = useState(0)
  const [myNickname, setMyNickname]   = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [soundOn, setSoundOn]         = useState(false)
  const [activeSheet, setActiveSheet] = useState<Sheet>('main')
  const [activeTab, setActiveTab]     = useState<RibbonTab>('home')
  const [sortMode, setSortMode]       = useState<SortMode>('time')
  const [filterMine, setFilterMine]   = useState(false)
  const [colWidths, setColWidths]     = useState<ColWidths>({ A: 56, B: 110, D: 90, E: 60 })
  const [zoom, setZoom]               = useState(100)
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('daenamu_visited'))
  const [wakeSeconds, setWakeSeconds] = useState(0)
  const inputRef   = useRef<HTMLInputElement>(null)
  const resizeRef  = useRef<{ col: keyof ColWidths; startX: number; startW: number } | null>(null)

  useEffect(() => {
    let wakeTimer: ReturnType<typeof setInterval> | null = null
    socket.on('connect', () => {
      setIsConnected(true)
      setWakeSeconds(0)
      if (wakeTimer) { clearInterval(wakeTimer); wakeTimer = null }
    })
    socket.on('disconnect', () => {
      setIsConnected(false)
      setWakeSeconds(0)
      wakeTimer = setInterval(() => setWakeSeconds(s => s + 1), 1000)
    })
    // 첫 접속 시 연결 안 되면 타이머 시작
    wakeTimer = setInterval(() => setWakeSeconds(s => s + 1), 1000)
    socket.on('nickname',   (nick: string) => setMyNickname(nick))
    socket.on('userCount',  (n: number)    => setUserCount(n))
    socket.on('message',    (msg: ChatMessage) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev.slice(-200), msg])
      if (document.hidden) {
        document.title = '🔔 새 메시지 — 대나무숲'
      }
    })
    // 소켓이 이미 연결된 상태라면 리스너 등록 전에 이벤트를 놓쳤을 수 있으므로 직접 요청
    if (socket.connected) {
      setIsConnected(true)
      setWakeSeconds(0)
      if (wakeTimer) { clearInterval(wakeTimer); wakeTimer = null }
      socket.emit('getCount')
    }

    const onVisible = () => { if (!document.hidden) document.title = '대나무숲' }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      socket.off('connect'); socket.off('disconnect')
      socket.off('nickname'); socket.off('userCount'); socket.off('message')
      document.removeEventListener('visibilitychange', onVisible)
      if (wakeTimer) clearInterval(wakeTimer)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = document.activeElement?.tagName === 'INPUT'
      if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput && selectedIds.size > 0) {
        setMessages(prev => prev.filter(m => !selectedIds.has(m.id)))
        setSelectedIds(new Set())
        return
      }
      if (!inInput && activeCell) {
        if      (e.key === 'ArrowUp')    { e.preventDefault(); setActiveCell(c => c ? {...c, row: Math.max(1, c.row-1)} : null) }
        else if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveCell(c => c ? {...c, row: Math.min(displayMessages.length+1, c.row+1)} : null) }
        else if (e.key === 'ArrowLeft')  { e.preventDefault(); setActiveCell(c => c ? {...c, col: Math.max(0, c.col-1)} : null) }
        else if (e.key === 'ArrowRight') { e.preventDefault(); setActiveCell(c => c ? {...c, col: Math.min(4, c.col+1)} : null) }
        else if (e.key === 'Escape')     { setActiveCell(null) }
        else if ((e.key==='c'||e.key==='C') && (e.ctrlKey||e.metaKey)) {
          const text = getCellText(displayMessages, activeCell, TODAY)
          if (text) navigator.clipboard.writeText(text).catch(() => {})
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeCell, selectedIds, messages, sortMode, filterMine])

  const displayMessages = useMemo(() => {
    let result = messages
    if (filterMine && myNickname) {
      result = result.filter(m => m.nickname === myNickname || m.nickname === '나')
    }
    if (sortMode === 'nick-asc') return [...result].sort((a,b) => a.nickname.localeCompare(b.nickname,'ko'))
    if (sortMode === 'nick-desc') return [...result].sort((a,b) => b.nickname.localeCompare(a.nickname,'ko'))
    return result
  }, [messages, sortMode, filterMine, myNickname])

  const handleCellClick  = useCallback((row: number, col: number) => { setActiveCell({row,col}); setSelectedIds(new Set()) }, [])
  const deleteSelected   = useCallback(() => { setMessages(prev => prev.filter(m => !selectedIds.has(m.id))); setSelectedIds(new Set()) }, [selectedIds])
  const toggleSelect     = useCallback((id: string, multi: boolean) => {
    setActiveCell(null)
    setSelectedIds(prev => { const next = multi ? new Set(prev) : new Set<string>(); if(next.has(id)) next.delete(id); else next.add(id); return next })
  }, [])

  const handleShout = useCallback((raw: string) => {
    const transformed = transform(raw)
    const intensity   = curseLevel(raw)
    const id          = Math.random().toString(36).slice(2, 10)
    const msg: ChatMessage = { id, nickname: myNickname||'나', text: transformed, original: raw, timestamp: Date.now() }
    setMessages(prev => [...prev.slice(-200), msg])
    setSelectedIds(new Set())
    setActiveCell(null)
    if (soundOn) playShout(intensity + 1)
    socket.emit('shout', { text: transformed, original: raw, shoutId: id })
    // GA 이벤트
    const tier = intensity === 0 ? 'clean' : intensity <= 2 ? 'mild' : intensity <= 5 ? 'spicy' : 'nuclear'
    window.gtag?.('event', 'shout', { curse_tier: tier, curse_count: intensity })
  }, [myNickname, soundOn])

  const handleSoundToggle = () => {
    if (!soundOn) { initSound(); setWindVolume(true) } else { setWindVolume(false) }
    setSoundOn(s => !s)
  }

  const clearFocus = () => { setActiveCell(null); setSelectedIds(new Set()); inputRef.current?.focus() }

  const startResize = useCallback((col: keyof ColWidths, startX: number) => {
    resizeRef.current = { col, startX, startW: colWidths[col] }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return
      const delta = e.clientX - resizeRef.current.startX
      const newW  = Math.max(40, resizeRef.current.startW + delta)
      setColWidths(prev => ({ ...prev, [resizeRef.current!.col]: newW }))
    }
    const onUp = () => {
      resizeRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [colWidths])
  const switchSheet = (s: Sheet) => { setActiveSheet(s); setActiveCell(null); setSelectedIds(new Set()) }

  const activeRow  = displayMessages.length + 2
  const activeTxt  = activeCell && activeSheet === 'main' ? getCellText(displayMessages, activeCell, TODAY) : null
  const nameBoxVal = activeCell && activeSheet === 'main'
    ? cellName(activeCell)
    : selectedIds.size > 0
      ? `${selectedIds.size}R`
      : activeSheet === 'monthly'
        ? '월별현황'
        : activeSheet === 'team'
          ? '팀별목표'
          : `B${activeRow}`

  const TABS: Array<{ label: string; id: RibbonTab | 'file' }> = [
    {label:'파일',           id:'file'},
    {label:'홈',             id:'home'},
    {label:'삽입',           id:'insert'},
    {label:'페이지 레이아웃', id:'layout'},
    {label:'수식',           id:'formula'},
    {label:'데이터',         id:'data'},
    {label:'검토',           id:'review'},
    {label:'보기',           id:'view'},
  ]

  const dismissOnboarding = () => {
    localStorage.setItem('daenamu_visited', '1')
    setShowOnboarding(false)
    inputRef.current?.focus()
  }

  return (
    <div className="xl-window" onClick={clearFocus}>

      {/* ── 타이틀바 ── */}
      <div className="xl-titlebar">
        <div className="xl-titlebar-left">
          <span className="xl-app-icon">🟢</span>
          <div className="xl-qat">
            <button className="xl-qat-btn" title="저장">💾</button>
            <button className="xl-qat-btn" title="실행취소">↩</button>
            <button className="xl-qat-btn" title="다시실행">↪</button>
          </div>
        </div>
        <span className="xl-title">분기별_업무보고_최종.xlsx - Excel</span>
        <div className="xl-titlebar-right">
          <button className="xl-winctr" title="최소화">─</button>
          <button className="xl-winctr" title="최대화">□</button>
          <button className="xl-winctr xl-close" title="닫기">✕</button>
        </div>
      </div>

      {/* ── 리본 탭 ── */}
      <div className="xl-ribbon-tabs">
        {TABS.map(t => (
          <span
            key={t.id}
            className={`xl-rtab ${t.id !== 'file' && activeTab === t.id ? 'active' : ''} ${t.id === 'file' ? 'xl-rtab-file' : ''}`}
            onClick={e => { e.stopPropagation(); if (t.id !== 'file') setActiveTab(t.id as RibbonTab) }}
          >{t.label}</span>
        ))}
        <div className="xl-rtab-filler"/>
        <button
          className={`xl-sound-btn ${soundOn ? 'on' : ''}`}
          onClick={e => { e.stopPropagation(); handleSoundToggle() }}
          title={soundOn ? '알림음 끄기' : '알림음 켜기'}
        >🔔 알림음</button>
      </div>

      {/* ── 리본 본문 ── */}
      <div className="xl-ribbon-body">
        {activeTab === 'home'    && <HomeRibbon selectedIds={selectedIds} deleteSelected={deleteSelected} />}
        {activeTab === 'insert'  && <InsertRibbon />}
        {activeTab === 'layout'  && <LayoutRibbon />}
        {activeTab === 'formula' && <FormulaRibbon />}
        {activeTab === 'data'    && <DataRibbon sortMode={sortMode} onSort={setSortMode} filterMine={filterMine} onFilterToggle={() => setFilterMine(f => !f)} />}
        {activeTab === 'review'  && <ReviewRibbon />}
        {activeTab === 'view'    && <ViewRibbon />}
      </div>

      {/* ── 수식 입력줄 ── */}
      <div className="xl-formulabar" onClick={e => e.stopPropagation()}>
        <div className="xl-namebox">{nameBoxVal}</div>
        <div className="xl-fb-sep"/>
        <span className="xl-fx">fx</span>
        <div className="xl-fb-sep"/>
        {activeTxt !== null ? (
          <span className="xl-fb-cellval" onClick={clearFocus} title="클릭하여 입력 모드로">
            {activeTxt || ' '}
          </span>
        ) : (
          <ShoutInput ref={inputRef} onShout={handleShout} />
        )}
      </div>

      {/* ── 시트 영역 ── */}
      <div className="xl-sheet" style={{ zoom: zoom / 100 }}>
        {activeSheet === 'main' && (
          <div className="xl-colheaders">
            <div className="xl-corner"/>
            {(['A','B','C','D','E'] as const).map((ltr, ci) => {
              const colKey = ltr as keyof ColWidths
              const w = ltr === 'C' ? undefined : colWidths[colKey]
              return (
                <div
                  key={ltr}
                  className={['xl-colhdr', ci===2?'xl-colflex':'', activeCell?.col===ci?'xl-colhdr-active':''].join(' ')}
                  style={w !== undefined ? {width: w, position:'relative'} : {position:'relative'}}
                >
                  {ltr}
                  {ltr !== 'C' && (
                    <div
                      className="xl-col-resize"
                      onMouseDown={e => { e.preventDefault(); e.stopPropagation(); startResize(colKey, e.clientX) }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeSheet === 'main' && (
          <ChatPanel
            messages={displayMessages}
            myNickname={myNickname}
            today={TODAY}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            activeCell={activeCell}
            onCellClick={handleCellClick}
            colWidths={colWidths}
          />
        )}
        {activeSheet === 'monthly' && <MonthlySheet messages={messages} today={TODAY} />}
        {activeSheet === 'team'    && <TeamSheet />}
      </div>

      {/* ── 하단 ── */}
      <div className="xl-bottom">
        <div className="xl-sheettabs">
          {([
            { id: 'main',    label: '업무현황'  },
            { id: 'monthly', label: '월별현황'  },
            { id: 'team',    label: '팀별목표'  },
          ] as Array<{id: Sheet; label: string}>).map(s => (
            <button
              key={s.id}
              className={`xl-stab ${activeSheet === s.id ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); switchSheet(s.id) }}
            >{s.label}</button>
          ))}
          <button className="xl-stab-add" title="시트 추가">⊕</button>
        </div>
        <div className="xl-statusbar">
          <span>준비</span>
          {activeSheet === 'main' && activeCell && (
            <span className="xl-sel-hint">{cellName(activeCell)} — Ctrl+C 복사 | Esc 해제</span>
          )}
          {activeSheet === 'main' && !activeCell && selectedIds.size > 0 && (
            <span className="xl-sel-hint">{selectedIds.size}개 행 선택됨 — Delete로 삭제</span>
          )}
          {sortMode !== 'time' && (
            <span className="xl-sel-hint">정렬 중: {sortMode === 'nick-asc' ? '담당자 A→Z' : '담당자 Z→A'}</span>
          )}
          {filterMine && <span className="xl-sel-hint">필터: 내 메시지만</span>}
          {userCount > 0 && <span>접속자: {userCount}명</span>}
          <span className={isConnected ? 'xl-ok' : 'xl-off'}>
            {isConnected ? '● 연결됨' : '○ 연결 중'}
          </span>
          <div className="xl-viewbtns">
            <button className="xl-viewbtn active">▦</button>
            <button className="xl-viewbtn">📄</button>
          </div>
          <input type="range" className="xl-zoom" min={60} max={200} value={zoom}
            onChange={e => setZoom(Number(e.target.value))} title="확대/축소"/>
          <span className="xl-zoomlabel">{zoom}%</span>
        </div>
      </div>

      {/* ── 서버 웨이크업 배너 ── */}
      {!isConnected && wakeSeconds >= 3 && (
        <div className="xl-wakebanner">
          <span className="xl-wake-spin">⏳</span>
          <span>
            {wakeSeconds < 10
              ? '서버 연결 중...'
              : wakeSeconds < 20
              ? '서버가 자고 있었나봐요. 깨우는 중... (무료 서버의 애환)'
              : `${wakeSeconds}초째 기다리는 중... 서버가 숙면 중입니다. 조금만요.`}
          </span>
        </div>
      )}

      {/* ── 온보딩 모달 ── */}
      {showOnboarding && (
        <div className="xl-modal-backdrop" onClick={dismissOnboarding}>
          <div className="xl-modal" onClick={e => e.stopPropagation()}>
            <div className="xl-modal-titlebar">
              <span>📊 Microsoft Excel</span>
              <button className="xl-modal-close" onClick={dismissOnboarding}>✕</button>
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
              <button className="xl-modal-btn" onClick={dismissOnboarding}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
