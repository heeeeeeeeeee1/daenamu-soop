import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShoutInput from './ShoutInput'

describe('ShoutInput', () => {
  it('Enter를 누르면 입력한 텍스트로 onShout이 호출되고 입력창이 비워진다', async () => {
    const onShout = vi.fn()
    render(<ShoutInput onShout={onShout} />)
    const input = screen.getByPlaceholderText('업무 내용을 입력하고 Enter를 누르세요')

    await userEvent.type(input, '아 진짜 짜증나{Enter}')

    expect(onShout).toHaveBeenCalledWith('아 진짜 짜증나')
    expect(input).toHaveValue('')
  })

  it('공백만 입력하고 Enter를 누르면 onShout이 호출되지 않는다', async () => {
    const onShout = vi.fn()
    render(<ShoutInput onShout={onShout} />)
    const input = screen.getByPlaceholderText('업무 내용을 입력하고 Enter를 누르세요')

    await userEvent.type(input, '   {Enter}')

    expect(onShout).not.toHaveBeenCalled()
  })

  it('앞뒤 공백은 trim되어 전달된다', async () => {
    const onShout = vi.fn()
    render(<ShoutInput onShout={onShout} />)
    const input = screen.getByPlaceholderText('업무 내용을 입력하고 Enter를 누르세요')

    await userEvent.type(input, '  안녕하세요  {Enter}')

    expect(onShout).toHaveBeenCalledWith('안녕하세요')
  })

  it('Escape를 누르면 onShout 호출 없이 입력값이 지워진다', async () => {
    const onShout = vi.fn()
    render(<ShoutInput onShout={onShout} />)
    const input = screen.getByPlaceholderText('업무 내용을 입력하고 Enter를 누르세요')

    await userEvent.type(input, '지워질 텍스트{Escape}')

    expect(input).toHaveValue('')
    expect(onShout).not.toHaveBeenCalled()
  })

  it('최대 200자로 제한된다 (maxLength)', () => {
    render(<ShoutInput onShout={vi.fn()} />)
    const input = screen.getByPlaceholderText('업무 내용을 입력하고 Enter를 누르세요')
    expect(input).toHaveAttribute('maxlength', '200')
  })
})
