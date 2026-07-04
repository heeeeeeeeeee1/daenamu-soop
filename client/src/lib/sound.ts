let audioCtx: AudioContext | null = null
let windGainNode: GainNode | null = null
let windSource: AudioBufferSourceNode | null = null

export function initSound(): void {
  if (audioCtx) return
  audioCtx = new AudioContext()
  createWind()
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
  windGainNode.gain.setTargetAtTime(on ? 0.04 : 0, audioCtx.currentTime, 0.8)
}

export function playShout(intensity: number = 1): void {
  if (!audioCtx) return

  const now = audioCtx.currentTime
  const duration = 1.2

  // 메아리 tone sweep
  const osc = audioCtx.createOscillator()
  const oscGain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(300 + intensity * 100, now)
  osc.frequency.exponentialRampToValueAtTime(80, now + duration)
  oscGain.gain.setValueAtTime(0.15, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.connect(oscGain)
  oscGain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + duration)

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
  swGain.gain.setValueAtTime(0.08 * Math.min(intensity, 3), now)
  swGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

  swSrc.connect(swFilter)
  swFilter.connect(swGain)
  swGain.connect(audioCtx.destination)
  swSrc.start(now)
}
