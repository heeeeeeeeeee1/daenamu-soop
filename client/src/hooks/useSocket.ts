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
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev.slice(-200), msg])
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
