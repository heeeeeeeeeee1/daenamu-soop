import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TeamSheet from './TeamSheet'
import type { ChatMessage } from './ChatPanel'

function msg(nickname: string, text: string, id = Math.random().toString(36)): ChatMessage {
  return { id, nickname, text, timestamp: Date.now() }
}

describe('TeamSheet', () => {
  it('메시지가 없으면 데이터 없음 안내를 보여준다', () => {
    render(<TeamSheet messages={[]} today="07/05" />)
    expect(screen.getByText(/데이터 없음/)).toBeInTheDocument()
  })

  it('닉네임 접미사(직군)로 메시지를 묶어 실적으로 집계한다', () => {
    const messages = [
      msg('성난영업사원', '메시지1'),
      msg('지친영업사원', '메시지2'),
      msg('억울한개발자', '메시지3'),
    ]
    render(<TeamSheet messages={messages} today="07/05" />)

    // 영업사원 그룹 2건, 개발자 그룹 1건
    expect(screen.getByText('영업사원')).toBeInTheDocument()
    expect(screen.getByText('개발자')).toBeInTheDocument()
    expect(screen.getByText('2건')).toBeInTheDocument()
  })

  it('"영업사원"이 "사원" 그룹으로 잘못 묶이지 않는다 (긴 명사 우선 매칭)', () => {
    const messages = [
      msg('성난영업사원', '영업 메시지'),
      msg('지친사원', '사원 메시지'),
    ]
    render(<TeamSheet messages={messages} today="07/05" />)

    expect(screen.getByText('영업사원')).toBeInTheDocument()
    expect(screen.getByText('사원')).toBeInTheDocument()
    // 두 그룹 모두 1건씩 — 만약 "영업사원"이 "사원"으로 오분류됐다면 "사원" 그룹이 2건이 됐을 것
    const oneGeon = screen.getAllByText('1건')
    expect(oneGeon).toHaveLength(2)
  })

  it('그룹 내 가장 많이 말한 닉네임이 "팀장"으로 표시된다', () => {
    const messages = [
      msg('성난개발자', 'a'), msg('성난개발자', 'b'), msg('성난개발자', 'c'),
      msg('지친개발자', 'd'),
    ]
    render(<TeamSheet messages={messages} today="07/05" />)
    expect(screen.getByText('성난개발자')).toBeInTheDocument()
  })

  it('알 수 없는 닉네임(직군 명사와 매칭 안 됨)은 집계에서 제외된다', () => {
    const messages = [msg('나', '서버 연결 전 임시 닉네임')]
    render(<TeamSheet messages={messages} today="07/05" />)
    expect(screen.getByText(/데이터 없음/)).toBeInTheDocument()
  })

  it('마감일 컬럼에 today prop 값을 보여준다', () => {
    render(<TeamSheet messages={[msg('성난팀원', '메시지')]} today="12/25" />)
    expect(screen.getByText('12/25')).toBeInTheDocument()
  })
})
