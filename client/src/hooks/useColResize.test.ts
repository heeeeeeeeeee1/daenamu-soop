import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColResize } from './useColResize'

function moveMouse(clientX: number) {
  window.dispatchEvent(new MouseEvent('mousemove', { clientX }))
}
function releaseMouse() {
  window.dispatchEvent(new MouseEvent('mouseup'))
}

describe('useColResize', () => {
  it('기본 열 너비를 제공한다', () => {
    const { result } = renderHook(() => useColResize())
    expect(result.current.colWidths).toEqual({ A: 56, B: 110, D: 90, E: 60 })
  })

  it('오른쪽 경계 핸들(기본 방향): 오른쪽으로 드래그하면 해당 열이 넓어진다', () => {
    const { result } = renderHook(() => useColResize())
    act(() => { result.current.startResize('A', 100) })
    act(() => { moveMouse(140) }) // +40px
    act(() => { releaseMouse() })
    expect(result.current.colWidths.A).toBe(56 + 40)
  })

  it('최소 너비(40px) 아래로는 줄어들지 않는다', () => {
    const { result } = renderHook(() => useColResize())
    act(() => { result.current.startResize('E', 100) })
    act(() => { moveMouse(-1000) })
    act(() => { releaseMouse() })
    expect(result.current.colWidths.E).toBe(40)
  })

  it('C/D 경계 핸들(direction=-1): 오른쪽으로 드래그하면 D열이 좁아진다 (C열이 넓어지는 방향)', () => {
    const { result } = renderHook(() => useColResize())
    act(() => { result.current.startResize('D', 100, -1) })
    act(() => { moveMouse(140) }) // 오른쪽으로 40px
    act(() => { releaseMouse() })
    expect(result.current.colWidths.D).toBe(90 - 40)
  })

  it('C/D 경계 핸들(direction=-1): 왼쪽으로 드래그하면 D열이 넓어진다', () => {
    const { result } = renderHook(() => useColResize())
    act(() => { result.current.startResize('D', 100, -1) })
    act(() => { moveMouse(70) }) // 왼쪽으로 30px
    act(() => { releaseMouse() })
    expect(result.current.colWidths.D).toBe(90 + 30)
  })

  it('마우스를 뗀 뒤에는 더 이상 이동에 반응하지 않는다', () => {
    const { result } = renderHook(() => useColResize())
    act(() => { result.current.startResize('B', 100) })
    act(() => { moveMouse(140) })
    act(() => { releaseMouse() })
    const widthAfterUp = result.current.colWidths.B

    act(() => { moveMouse(300) }) // mouseup 이후 이동은 무시되어야 함
    expect(result.current.colWidths.B).toBe(widthAfterUp)
  })
})
