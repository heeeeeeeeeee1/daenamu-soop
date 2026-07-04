import React, { useState, forwardRef } from 'react'

interface Props {
  onShout: (text: string) => void
}

const ShoutInput = forwardRef<HTMLInputElement, Props>(({ onShout }, ref) => {
  const [text, setText] = useState('')

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onShout(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.nativeEvent.isComposing) return  // Mac 한글 IME 이중입력 방지
      submit()
    }
    if (e.key === 'Escape') setText('')
  }

  return (
    <input
      ref={ref}
      type="text"
      className="xl-fbinput"
      value={text}
      onChange={e => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="업무 내용을 입력하고 Enter를 누르세요"
      maxLength={200}
      autoComplete="off"
      spellCheck={false}
    />
  )
})

ShoutInput.displayName = 'ShoutInput'
export default ShoutInput
