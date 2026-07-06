import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import ShoutInput from './components/ShoutInput'
import ChatPanel, { type ChatMessage } from './components/ChatPanel'
import MonthlySheet from './components/MonthlySheet'
import TeamSheet from './components/TeamSheet'
import { OnboardingModal } from './components/OnboardingModal'
import { WakeBanner } from './components/WakeBanner'
import {
  HomeRibbon, InsertRibbon, LayoutRibbon, FormulaRibbon,
  DataRibbon, ReviewRibbon, ViewRibbon,
} from './components/ribbon'
import {
  IconExcelLogo, IconSave, IconUndo, IconRedo, IconChevronDown, IconSearch, IconShare, IconPerson, IconHeaderFooter,
} from './components/ribbon/icons'
import { useSocket } from './hooks/useSocket'
import { useColResize } from './hooks/useColResize'
import { cellName, getCellText } from './lib/cellHelpers'
import { transform, curseLevel } from './lib/transformDictionary'
import { initSound, setWindVolume, playShout } from './lib/sound'
import { socket } from './lib/socket'
import type { CellAddr, Sheet, RibbonTab, SortMode } from './types'
import './index.css'

const TODAY = new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
  .replace('. ', '/').replace('.', '')

const RIBBON_TABS: Array<{ label: string; id: RibbonTab | 'file' }> = [
  { label: '파일',           id: 'file' },
  { label: '홈',             id: 'home' },
  { label: '삽입',           id: 'insert' },
  { label: '페이지 레이아웃', id: 'layout' },
  { label: '수식',           id: 'formula' },
  { label: '데이터',         id: 'data' },
  { label: '검토',           id: 'review' },
  { label: '보기',           id: 'view' },
]

const SHEET_TABS: Array<{ id: Sheet; label: string }> = [
  { id: 'main',    label: '업무현황' },
  { id: 'monthly', label: '월별현황' },
  { id: 'team',    label: '팀별목표' },
]

function App() {
  const { messages, setMessages, myNickname, isConnected, userCount, wakeSeconds } = useSocket()
  const { colWidths, startResize } = useColResize()

  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set())
  const [activeCell, setActiveCell]     = useState<CellAddr | null>(null)
  const [soundOn, setSoundOn]           = useState(false)
  const [activeSheet, setActiveSheet]   = useState<Sheet>('main')
  const [activeTab, setActiveTab]       = useState<RibbonTab>('home')
  const [sortMode, setSortMode]         = useState<SortMode>('time')
  const [filterMine, setFilterMine]     = useState(false)
  const [zoom, setZoom]                 = useState(100)
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('daenamu_visited'))

  const inputRef = useRef<HTMLInputElement>(null)

  const displayMessages = useMemo(() => {
    const filtered = filterMine && myNickname
      ? messages.filter(m => m.nickname === myNickname || m.nickname === '나')
      : messages
    if (sortMode === 'nick-asc')  return [...filtered].sort((a, b) => a.nickname.localeCompare(b.nickname, 'ko'))
    if (sortMode === 'nick-desc') return [...filtered].sort((a, b) => b.nickname.localeCompare(a.nickname, 'ko'))
    return filtered
  }, [messages, sortMode, filterMine, myNickname])

  // 키보드 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = document.activeElement?.tagName === 'INPUT'

      if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput && selectedIds.size > 0) {
        setMessages(prev => prev.filter(m => !selectedIds.has(m.id)))
        setSelectedIds(new Set())
        return
      }

      if (!inInput && activeCell) {
        const rowMax = displayMessages.length + 1
        if      (e.key === 'ArrowUp')    { e.preventDefault(); setActiveCell(c => c ? { ...c, row: Math.max(1, c.row - 1) } : null) }
        else if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveCell(c => c ? { ...c, row: Math.min(rowMax, c.row + 1) } : null) }
        else if (e.key === 'ArrowLeft')  { e.preventDefault(); setActiveCell(c => c ? { ...c, col: Math.max(0, c.col - 1) } : null) }
        else if (e.key === 'ArrowRight') { e.preventDefault(); setActiveCell(c => c ? { ...c, col: Math.min(4, c.col + 1) } : null) }
        else if (e.key === 'Escape')     { setActiveCell(null) }
        else if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey)) {
          const text = getCellText(displayMessages, activeCell, TODAY)
          if (text) navigator.clipboard.writeText(text).catch(() => {})
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeCell, selectedIds, displayMessages, setMessages])

  const handleShout = useCallback((raw: string) => {
    const transformed = transform(raw)
    const intensity   = curseLevel(raw)
    const id          = Math.random().toString(36).slice(2, 10)

    setMessages(prev => [...prev.slice(-200), {
      id, nickname: myNickname || '나', text: transformed, original: raw, timestamp: Date.now(),
    }])
    setSelectedIds(new Set())
    setActiveCell(null)

    if (soundOn) playShout(intensity + 1)
    socket.emit('shout', { text: transformed, original: raw, shoutId: id })

    const tier = intensity === 0 ? 'clean' : intensity <= 2 ? 'mild' : intensity <= 5 ? 'spicy' : 'nuclear'
    window.gtag?.('event', 'shout', { curse_tier: tier, curse_count: intensity })
  }, [myNickname, soundOn, setMessages])

  const handleReport = useCallback((msg: ChatMessage) => {
    socket.emit('report', {
      messageId: msg.id,
      nickname: msg.nickname,
      text: msg.text,
      original: msg.original,
    })
  }, [])

  const handleSoundToggle = useCallback(() => {
    if (!soundOn) { initSound(); setWindVolume(true) } else { setWindVolume(false) }
    setSoundOn(s => !s)
  }, [soundOn])

  const handleCellClick = useCallback((row: number, col: number) => {
    setActiveCell({ row, col })
    setSelectedIds(new Set())
  }, [])

  const handleToggleSelect = useCallback((id: string, multi: boolean) => {
    setActiveCell(null)
    setSelectedIds(prev => {
      const next = multi ? new Set(prev) : new Set<string>()
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const deleteSelected = useCallback(() => {
    setMessages(prev => prev.filter(m => !selectedIds.has(m.id)))
    setSelectedIds(new Set())
  }, [selectedIds, setMessages])

  const clearAll = useCallback(() => {
    if (!window.confirm('모든 메시지를 삭제할까요? (본인 화면에서만 사라지며 되돌릴 수 없습니다)')) return
    setMessages([])
    setSelectedIds(new Set())
    setActiveCell(null)
  }, [setMessages])

  const switchSheet = useCallback((s: Sheet) => {
    setActiveSheet(s)
    setActiveCell(null)
    setSelectedIds(new Set())
  }, [])

  const clearFocus = useCallback(() => {
    setActiveCell(null)
    setSelectedIds(new Set())
    inputRef.current?.focus()
  }, [])

  const dismissOnboarding = useCallback(() => {
    localStorage.setItem('daenamu_visited', '1')
    setShowOnboarding(false)
    inputRef.current?.focus()
  }, [])

  // 수식 입력줄 이름 상자 값
  const activeRow  = displayMessages.length + 2
  const activeTxt  = activeCell && activeSheet === 'main' ? getCellText(displayMessages, activeCell, TODAY) : null
  const nameBoxVal = activeCell && activeSheet === 'main'
    ? cellName(activeCell)
    : selectedIds.size > 0 ? `${selectedIds.size}R`
    : activeSheet === 'monthly' ? '월별현황'
    : activeSheet === 'team'    ? '팀별목표'
    : `B${activeRow}`

  return (
    <div className="xl-window" onClick={clearFocus}>

      {/* 타이틀바 */}
      <div className="xl-titlebar">
        <div className="xl-titlebar-left">
          <span
            className="xl-app-icon"
            title="온보딩 다시보기"
            onClick={e => { e.stopPropagation(); setShowOnboarding(true) }}
          ><IconExcelLogo size={18} /></span>
          <div className="xl-qat">
            <button className="xl-qat-btn" title="저장"><IconSave /></button>
            <button className="xl-qat-btn" title="실행취소"><IconUndo /></button>
            <button className="xl-qat-btn" title="다시실행"><IconRedo /></button>
            <button className="xl-qat-btn xl-qat-more" title="빠른 실행 도구 모음 사용자 지정"><IconChevronDown size={9} /></button>
          </div>
        </div>
        <div className="xl-titlebar-center">
          <span className="xl-title">분기별_업무보고_최종.xlsx - Excel</span>
          <span className="xl-autosave">
            <span className="xl-autosave-dot" /> 자동 저장 켬
          </span>
        </div>
        <div className="xl-titlebar-search">
          <IconSearch size={13} className="xl-titlebar-search-icon" />
          <span className="xl-titlebar-search-text">검색</span>
        </div>
        <div className="xl-titlebar-right">
          <button className="xl-titlebar-iconbtn" title="공유"><IconShare /> 공유</button>
          <button className="xl-titlebar-iconbtn" title="로그인"><IconPerson /> 로그인</button>
          <button className="xl-winctr" title="최소화">─</button>
          <button className="xl-winctr" title="최대화">□</button>
          <button className="xl-winctr xl-close" title="닫기">✕</button>
        </div>
      </div>

      {/* 리본 탭 */}
      <div className="xl-ribbon-tabs">
        {RIBBON_TABS.map(t => (
          <span
            key={t.id}
            className={[
              'xl-rtab',
              t.id !== 'file' && activeTab === t.id ? 'active' : '',
              t.id === 'file' ? 'xl-rtab-file' : '',
            ].join(' ')}
            onClick={e => { e.stopPropagation(); if (t.id !== 'file') setActiveTab(t.id as RibbonTab) }}
          >{t.label}</span>
        ))}
        <div className="xl-rtab-filler"/>
        <button
          className={`xl-sound-btn ${soundOn ? 'on' : ''}`}
          onClick={e => { e.stopPropagation(); handleSoundToggle() }}
          title={soundOn ? '효과음 끄기' : '효과음 켜기'}
        >🔔 효과음</button>
      </div>

      {/* 리본 본문 */}
      <div className="xl-ribbon-body">
        {activeTab === 'home'    && <HomeRibbon selectedIds={selectedIds} deleteSelected={deleteSelected} clearAll={clearAll} />}
        {activeTab === 'insert'  && <InsertRibbon />}
        {activeTab === 'layout'  && <LayoutRibbon />}
        {activeTab === 'formula' && <FormulaRibbon />}
        {activeTab === 'data'    && <DataRibbon sortMode={sortMode} onSort={setSortMode} filterMine={filterMine} onFilterToggle={() => setFilterMine(f => !f)} />}
        {activeTab === 'review'  && <ReviewRibbon />}
        {activeTab === 'view'    && <ViewRibbon />}
      </div>

      {/* 수식 입력줄 */}
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

      {/* 시트 영역 */}
      <div className="xl-sheet">
        <div className="xl-zoom-content" style={{ zoom: zoom / 100 }}>
          {activeSheet === 'main' && (
            <div className="xl-colheaders">
              <div className="xl-corner"/>
              {(['A', 'B', 'C', 'D', 'E'] as const).map((ltr, ci) => {
                const colKey = ltr as keyof typeof colWidths
                const w = ltr === 'C' ? undefined : colWidths[colKey]
                return (
                  <div
                    key={ltr}
                    className={['xl-colhdr', ci === 2 ? 'xl-colflex' : '', activeCell?.col === ci ? 'xl-colhdr-active' : ''].join(' ')}
                    style={w !== undefined ? { width: w, position: 'relative' } : { position: 'relative' }}
                  >
                    {ltr}
                    {ltr === 'C' ? (
                      // C열은 가변폭이라 자체 너비가 없음 — C/D 경계 핸들은 D열 너비를
                      // 반대 방향으로 조절해 이 경계를 실제로 드래그할 수 있게 한다.
                      <div
                        className="xl-col-resize"
                        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); startResize('D', e.clientX, -1) }}
                      />
                    ) : (
                      <div
                        className="xl-col-resize"
                        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); startResize(colKey, e.clientX) }}
                      />
                    )}
                  </div>
                )
              })}
              {/* ChatPanel 행에 있는 신고 전용 열(.xl-actioncol)과 같은 폭이어야
                  C열 flex 비율이 맞아서 D/E 경계선이 아래 행들과 정렬된다. */}
              <div className="xl-colhdr xl-colhdr-spacer">F</div>
            </div>
          )}
          {activeSheet === 'main' && (
            <ChatPanel
              messages={displayMessages}
              myNickname={myNickname}
              today={TODAY}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              activeCell={activeCell}
              onCellClick={handleCellClick}
              colWidths={colWidths}
              onReport={handleReport}
            />
          )}
          {activeSheet === 'monthly' && <MonthlySheet messages={messages} today={TODAY} />}
          {activeSheet === 'team'    && <TeamSheet messages={messages} today={TODAY} />}
        </div>
      </div>

      {/* 하단 바 */}
      <div className="xl-bottom">
        <div className="xl-sheettabs">
          {SHEET_TABS.map(s => (
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
            <button className="xl-viewbtn"><IconHeaderFooter size={11} /></button>
          </div>
          <input
            type="range" className="xl-zoom" min={60} max={200} value={zoom}
            onChange={e => setZoom(Number(e.target.value))} title="확대/축소"
          />
          <span className="xl-zoomlabel">{zoom}%</span>
        </div>
      </div>

      {!isConnected && wakeSeconds >= 3 && <WakeBanner seconds={wakeSeconds} />}
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
    </div>
  )
}

export default App
