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
      if (!resizeRef.current) return
      const delta = (e.clientX - resizeRef.current.startX) * resizeRef.current.direction
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

  return { colWidths, startResize }
}
