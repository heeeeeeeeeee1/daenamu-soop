import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./lib/socket', () => {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {}
  const socket = {
    connected: false,
    on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      (handlers[event] ??= []).push(cb)
    }),
    off: vi.fn((event: string) => { delete handlers[event] }),
    emit: vi.fn(),
  }
  return { socket }
})

// App.tsx가 최상단에서 import 하므로 실제 모듈을 mock으로 대체한다
import App from './App'

describe('App - 온보딩 모달 표시/재열람', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('최초 방문(localStorage 비어있음) 시 온보딩 모달이 자동으로 뜬다', () => {
    render(<App />)
    expect(screen.getByText('업무 관련 중요 공지')).toBeInTheDocument()
  })

  it('이미 방문한 적이 있으면(localStorage 설정됨) 온보딩이 자동으로 뜨지 않는다', () => {
    localStorage.setItem('daenamu_visited', '1')
    render(<App />)
    expect(screen.queryByText('업무 관련 중요 공지')).not.toBeInTheDocument()
  })

  it('"확인" 클릭 시 온보딩이 닫히고 방문 기록이 저장된다', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: '확인' }))

    expect(screen.queryByText('업무 관련 중요 공지')).not.toBeInTheDocument()
    expect(localStorage.getItem('daenamu_visited')).toBe('1')
  })

  it('닫은 뒤에도 타이틀바 🟢 아이콘을 클릭하면 온보딩을 다시 볼 수 있다', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: '확인' }))
    expect(screen.queryByText('업무 관련 중요 공지')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTitle('온보딩 다시보기'))
    expect(screen.getByText('업무 관련 중요 공지')).toBeInTheDocument()
  })

  it('재열람은 방문 기록(localStorage)을 건드리지 않는다', async () => {
    localStorage.setItem('daenamu_visited', '1')
    render(<App />)
    await userEvent.click(screen.getByTitle('온보딩 다시보기'))

    expect(screen.getByText('업무 관련 중요 공지')).toBeInTheDocument()
    expect(localStorage.getItem('daenamu_visited')).toBe('1')
  })
})
