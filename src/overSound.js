// 互換のための薄いラッパー。実体は audio.js のアンロック済み音声を使い回す。
import { playOver, stopOver } from './audio'

export function playOverSound(src) {
  playOver(src.includes('miss') ? 'miss' : 'gameover')
}

export function stopOverSound() {
  stopOver()
}
