import type { SortMode } from '../../types'
import { IconPlug, IconTextBox, IconGlobe, IconSplit, IconNoEntry, IconLink, IconBarChart } from './icons'

interface Props {
  sortMode: SortMode
  onSort: (mode: SortMode) => void
  filterMine: boolean
  onFilterToggle: () => void
}

export function DataRibbon({ sortMode, onSort, filterMine, onFilterToggle }: Props) {
  return <>
    <div className="xl-rgroup">
      <button className="xl-rbtn-tall" style={{width:54}}><IconPlug /><span style={{fontSize:9}}>데이터 가져오기</span></button>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn"><IconTextBox size={12} /> 텍스트/CSV</button>
        <button className="xl-rbtn"><IconGlobe size={12} /> 웹</button>
        <button className="xl-rbtn">⊞ 표/범위</button>
      </div>
      <span className="xl-rgroup-label">데이터 가져오기</span>
    </div>
    <div className="xl-rsep"/>
    <div className="xl-rgroup">
      <button
        className={`xl-rbtn-tall ${sortMode === 'nick-asc' ? 'xl-rbtn-active' : ''}`}
        onClick={e => { e.stopPropagation(); onSort(sortMode === 'nick-asc' ? 'time' : 'nick-asc') }}
        title="담당자 이름 오름차순 정렬"
      >A↑Z<br/><span style={{fontSize:9}}>오름차순</span></button>
      <button
        className={`xl-rbtn-tall ${sortMode === 'nick-desc' ? 'xl-rbtn-active' : ''}`}
        onClick={e => { e.stopPropagation(); onSort(sortMode === 'nick-desc' ? 'time' : 'nick-desc') }}
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
        <button className="xl-rbtn"><IconSplit size={12} /> 텍스트 나누기</button>
        <button className="xl-rbtn">⚡ 빠른 채우기</button>
        <button className="xl-rbtn"><IconNoEntry size={12} /> 중복 제거</button>
      </div>
      <div className="xl-rgroup-col">
        <button className="xl-rbtn">✓ 데이터 유효성</button>
        <button className="xl-rbtn"><IconLink size={12} /> 통합</button>
        <button className="xl-rbtn"><IconBarChart size={12} /> 가상 분석</button>
      </div>
      <span className="xl-rgroup-label">데이터 도구</span>
    </div>
  </>
}
