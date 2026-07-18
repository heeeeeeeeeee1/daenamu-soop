import { useState, useEffect } from 'react'
import { socket } from '../lib/socket'
import type { ChatMessage } from '../components/ChatPanel'

export function useSocket() {
  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [myNickname, setMyNickname] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount]   = useState(0)
  const [wakeSeconds, setWakeSeconds] = useState(0)

  useEffect(() => {
    let wakeTimer: ReturnType<typeof setInterval> | null = null

    const startWakeTimer = () => {
      if (wakeTimer) return
      wakeTimer = setInterval(() => setWakeSeconds(s => s + 1), 1000)
    }
    const stopWakeTimer = () => {
      if (wakeTimer) { clearInterval(wakeTimer); wakeTimer = null }
      setWakeSeconds(0)
    }

    socket.on('connect', () => { setIsConnected(true); stopWakeTimer() })
    socket.on('disconnect', () => { setIsConnected(false); startWakeTimer() })
    socket.on('nickname', (nick: string) => setMyNickname(nick))
    socket.on('userCount', (n: number) => setUserCount(n))
    socket.on('message', (msg: ChatMessage) => {
      // 내가 보낸 메시지는 낙관적으로 먼저 화면에 반영되지만, text는 서버가
      // original을 직접 변환한 값이 최종 결정본이다. id가 이미 있으면 그
      // 자리에서 서버 값으로 교체해 모든 클라이언트가 같은 문구를 보게 한다.
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === msg.id)
        if (idx === -1) return [...prev.slice(-200), msg]
        const next = [...prev]
        next[idx] = msg
        return next
      })
      if (document.hidden) document.title = '🔔 새 메시지 — 대나무숲'
    })

    if (socket.connected) {
      setIsConnected(true)
      socket.emit('getCount')
    } else {
      startWakeTimer()
    }

    const onVisible = () => { if (!document.hidden) document.title = '대나무숲' }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('nickname')
      socket.off('userCount')
      socket.off('message')
      document.removeEventListener('visibilitychange', onVisible)
      if (wakeTimer) clearInterval(wakeTimer)
    }
  }, [])

  return { messages, setMessages, myNickname, isConnected, userCount, wakeSeconds }
}
