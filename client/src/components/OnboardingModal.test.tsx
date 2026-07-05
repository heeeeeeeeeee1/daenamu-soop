import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingModal } from './OnboardingModal'

describe('OnboardingModal', () => {
  it('안내 문구를 렌더링한다', () => {
    render(<OnboardingModal onDismiss={vi.fn()} />)
    expect(screen.getByText('업무 관련 중요 공지')).toBeInTheDocument()
    expect(screen.getByText('대나무숲')).toBeInTheDocument()
  })

  it('배경(backdrop) 클릭 시 onDismiss가 호출된다', async () => {
    const onDismiss = vi.fn()
    const { container } = render(<OnboardingModal onDismiss={onDismiss} />)
    const backdrop = container.querySelector('.xl-modal-backdrop')!
    await userEvent.click(backdrop)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('모달 본문 클릭은 전파되지 않아 onDismiss가 호출되지 않는다', async () => {
    const onDismiss = vi.fn()
    const { container } = render(<OnboardingModal onDismiss={onDismiss} />)
    const body = container.querySelector('.xl-modal-body')!
    await userEvent.click(body)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('"확인" 버튼 클릭 시 onDismiss가 호출된다', async () => {
    const onDismiss = vi.fn()
    render(<OnboardingModal onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: '확인' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('닫기(✕) 버튼 클릭 시 onDismiss가 호출된다', async () => {
    const onDismiss = vi.fn()
    render(<OnboardingModal onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: '✕' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('버그 제보 링크가 GitHub 이슈 페이지를 새 탭으로 연다', () => {
    render(<OnboardingModal onDismiss={vi.fn()} />)
    const link = screen.getByRole('link', { name: /버그 제보/ })
    expect(link).toHaveAttribute('href', 'https://github.com/heeeeeeeeeee1/daenamu-soop/issues')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
