import { useState, useRef, useCallback } from 'react'
import type { ColWidths } from '../types'

export function useColResize() {
  const [colWidths, setColWidths] = useState<ColWidths>({ A: 56, B: 110, D: 90, E: 60 })
  const resizeRef = useRef<{ col: keyof ColWidths; startX: number; startW: number; direction: 1 | -1 } | null>(null)

  // direction: 핸들이 열의 오른쪽 경계에 있으면 1(오른쪽 드래그=넓어짐),
  // 왼쪽 경계(예: 가변폭인 C열과의 경계)에 있으면 -1(오른쪽 드래그=좁아짐)
  const startResize = useCallback((col: keyof ColWidths, startX: number, direction: 1 | -1 = 1) => {
    resizeRef.current = { col, startX, startW: colWidths[col], direction }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (e: MouseEvent) => {
      const current = resizeRef.current
      if (!current) return
      // current를 지역 변수로 캡처해서 setColWidths 업데이터 함수 안에서 사용한다.
      // resizeRef.current를 업데이터 안에서 다시 읽으면, React가 이 업데이트를
      // 지연 실행하는 사이 mouseup으로 resizeRef.current가 null이 되어 있을 수 있다.
      const delta = (e.clientX - current.startX) * current.direction
      const newW  = Math.max(40, current.startW + delta)
      setColWidths(prev => ({ ...prev, [current.col]: newW }))
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

  return { colWidths, startResize }
}
