import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

Sentry.init({
  dsn: 'https://f75ba9010fb1e43ce55d6bbad82bf110@o4511499988959232.ingest.us.sentry.io/4511675770404864',
  environment: location.hostname === 'localhost' ? 'development' : 'production',
  tracesSampleRate: 0.2,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p style={{padding:20}}>오류가 발생했습니다. 새로고침 해주세요.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
