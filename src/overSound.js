// ゲームオーバー/ミス音声を一元管理する。
// 再生中の音声を保持し、画面遷移後でも停止できるようにする。
let current = null

export function playOverSound(src) {
  stopOverSound()
  const audio = new Audio(src)
  audio.play().catch(() => {}) // autoplay制限で失敗しても無視
  current = audio
}

export function stopOverSound() {
  if (current) {
    current.pause()
    current.currentTime = 0
    current = null
  }
}
