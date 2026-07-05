let audioCtx: AudioContext | null = null
let windGainNode: GainNode | null = null
let windSource: AudioBufferSourceNode | null = null
let koreanVoices: SpeechSynthesisVoice[] = []

export function initSound(): void {
  if (audioCtx) return
  audioCtx = new AudioContext()
  createWind()
  loadKoreanVoices()
}

// ─── "임금님 귀는 당나귀 귀!" 메아리 ──────────────────────────
// '~'는 TTS가 "물결표"라고 그대로 읽어버려서 뺐고, 대신 '!'로 끝에서
// 소리치듯 억양이 올라가게 한다.
// (문장을 "리드"+"귀!"로 쪼개 뒷부분만 pitch를 올리는 방식을 시도했으나,
//  서로 다른 utterance 사이에 브라우저가 어색한 공백을 넣어 오히려
//  메아리 페이드아웃 느낌이 깨졌다. 그래서 한 문장 = 한 utterance로 되돌리고,
//  볼륨만 점점 줄여 페이드아웃되는 메아리를 표현한다.)
const ECHO_PHRASE_FULL    = '임금님 귀는 당나귀 귀!'
const ECHO_PHRASE_REPEATS = ['당나귀 귀!', '귀!']
const ECHO_REPEAT_DELAYS  = [230, 430] // ms, 진짜 산울림처럼 빠르게 이어 붙도록 간격을 좁힘

let pendingEchoTimeouts: ReturnType<typeof setTimeout>[] = []

function loadKoreanVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const pick = () => {
    const found = window.speechSynthesis.getVoices().filter(v => v.lang?.toLowerCase().startsWith('ko'))
    if (found.length > 0) koreanVoices = found
  }
  pick()
  window.speechSynthesis.addEventListener('voiceschanged', pick, { once: true })
}

function pickRandomVoice(): SpeechSynthesisVoice | null {
  if (koreanVoices.length === 0) return null
  return koreanVoices[Math.floor(Math.random() * koreanVoices.length)]
}

function speakEcho(text: string, volume: number, voice: SpeechSynthesisVoice | null, pitch: number, rate: number): void {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ko-KR'
  if (voice) utter.voice = voice
  utter.volume = Math.max(0, Math.min(1, volume))
  utter.rate = rate
  utter.pitch = Math.max(0, Math.min(2, pitch))
  window.speechSynthesis.speak(utter)
}

function playEchoPhrase(intensity: number): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  // 이전 메아리가 아직 말하는 중이면 즉시 끊고, 예약해둔 반복도 취소한 뒤 새로 시작한다
  window.speechSynthesis.cancel()
  pendingEchoTimeouts.forEach(clearTimeout)
  pendingEchoTimeouts = []

  const baseVolume = Math.min(0.5 + intensity * 0.1, 1)

  // 외칠 때마다 목소리(성별/나이대 느낌)와 속도를 랜덤하게 골라, 같은 메아리 안에서는
  // 일관되게 유지한다 (반복될 때마다 목소리가 바뀌면 어색하므로)
  const voice = pickRandomVoice()
  // 대부분의 브라우저/OS에는 한국어 음성이 1개(대개 여성)만 설치돼 있어 실제
  // 음성 종류로는 변주가 거의 안 된다. 그래서 pitch 폭을 넓게 잡아 그 하나의
  // 음성으로도 저음(어른)/고음(아이·여성) 차이가 확실히 느껴지게 한다.
  const pitch = 0.6 + Math.random() * 1.0 // 0.6~1.6
  // 1.3배속을 넘으면 첫 단어("임금님 귀")가 뭉개지고, 1.2배속 이하는 느리게
  // 느껴져서 그 사이로 좁혔다.
  const rate  = 1.15 + Math.random() * 0.15 // 1.15~1.3

  speakEcho(ECHO_PHRASE_FULL, baseVolume, voice, pitch, rate)

  ECHO_PHRASE_REPEATS.forEach((phrase, i) => {
    const volume = baseVolume * 0.55 ** (i + 1) // 반복될수록 점점 작게
    const timeoutId = setTimeout(() => speakEcho(phrase, volume, voice, pitch, rate), ECHO_REPEAT_DELAYS[i])
    pendingEchoTimeouts.push(timeoutId)
  })
}

function createWind(): void {
  if (!audioCtx) return

  const bufferSize = 3 * audioCtx.sampleRate
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  windSource = audioCtx.createBufferSource()
  windSource.buffer = buffer
  windSource.loop = true

  const bandpass = audioCtx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 600
  bandpass.Q.value = 0.3

  const lowpass = audioCtx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 400

  windGainNode = audioCtx.createGain()
  windGainNode.gain.value = 0

  windSource.connect(bandpass)
  bandpass.connect(lowpass)
  lowpass.connect(windGainNode)
  windGainNode.connect(audioCtx.destination)
  windSource.start()
}

export function setWindVolume(on: boolean): void {
  if (!windGainNode || !audioCtx) return
  windGainNode.gain.setTargetAtTime(on ? 0.11 : 0, audioCtx.currentTime, 0.8)
}

export function playShout(intensity: number = 1): void {
  if (!audioCtx) return

  const now = audioCtx.currentTime

  // "임금님 귀는 당나귀 귀!" 메아리 (뒤로 갈수록 짧고 작게 반복)
  playEchoPhrase(intensity)

  // 바람 swoosh
  const swBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.4, audioCtx.sampleRate)
  const swData = swBuf.getChannelData(0)
  for (let i = 0; i < swData.length; i++) swData[i] = Math.random() * 2 - 1

  const swSrc = audioCtx.createBufferSource()
  swSrc.buffer = swBuf

  const swFilter = audioCtx.createBiquadFilter()
  swFilter.type = 'bandpass'
  swFilter.frequency.value = 1200

  const swGain = audioCtx.createGain()
  swGain.gain.setValueAtTime(0.045 * Math.min(intensity, 3), now)
  swGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

  swSrc.connect(swFilter)
  swFilter.connect(swGain)
  swGain.connect(audioCtx.destination)
  swSrc.start(now)
}
