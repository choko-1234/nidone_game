// 音声を一元管理する。
//
// スマホ（特にiOS Safari）では、ユーザー操作（タップ）の中で .play() を呼んだ
// 音声要素しか再生できない。そこで最初のタップ時に全音声を「無音で一瞬再生→停止」
// してアンロックし、同じ Audio 要素を使い回すことで、以降は setTimeout など
// 操作外からでも再生できるようにする。

const SOURCES = {
  ibiki: '/ibiki.mp3',
  miss: '/miss.mp3',
  gameover: '/gameover.mp3',
}

const elements = {}
let unlocked = false

function get(name) {
  if (!elements[name]) {
    const audio = new Audio(SOURCES[name])
    audio.preload = 'auto'
    if (name === 'ibiki') audio.loop = true
    elements[name] = audio
  }
  return elements[name]
}

// 必ずユーザー操作（クリック/タップ）のハンドラ内で呼ぶこと。
export function unlockAudio() {
  if (unlocked) return
  unlocked = true
  for (const name of Object.keys(SOURCES)) {
    const audio = get(name)
    const wasLoop = audio.loop
    audio.loop = false
    audio.muted = true
    const restore = () => {
      audio.pause()
      audio.currentTime = 0
      audio.muted = false
      audio.loop = wasLoop
    }
    const p = audio.play()
    if (p && p.then) p.then(restore).catch(() => { audio.muted = false; audio.loop = wasLoop })
    else restore()
  }
}

export function playSound(name) {
  const audio = get(name)
  audio.currentTime = 0
  audio.play().catch(() => {}) // autoplay制限で失敗しても無視
  return audio
}

export function stopSound(name) {
  const audio = elements[name]
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

// ミス/ゲームオーバー音は排他的に再生する（画面遷移後でも停止できるように）。
export function playOver(name) {
  stopOver()
  playSound(name)
}

export function stopOver() {
  stopSound('miss')
  stopSound('gameover')
}
