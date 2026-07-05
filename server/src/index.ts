import { createApp } from './app.js'

const { httpServer } = createApp()

const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`🎋 대나무숲 서버 포트 ${PORT} 실행 중`)
})
