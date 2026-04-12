import { useState, useEffect, useRef, useCallback } from 'react'
import AnalogClock from './AnalogClock'
import './GameScreen.css'

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// phase: 'intro' | 'awake' | 'falling' | 'sleeping' | 'opening'
export default function GameScreen({ gameState, onSleep, onWakeUp, formatTime }) {
  const { currentMinutes, limitMinutes, sleepCount, phase2Threshold, autoOver } = gameState

  const [phase, setPhase] = useState('intro')
  const [showWakeBtn, setShowWakeBtn] = useState(false)
  const [skipAmount, setSkipAmount] = useState(null)
  const [introEyelidClosing, setIntroEyelidClosing] = useState(false)
  const [clockEntryKey, setClockEntryKey] = useState(0)

  const prevMinutes = useRef(currentMinutes)
  const sleepStartRef = useRef(null)      // 目を閉じた瞬間の実時間
  const isPhase2Ref = useRef(false)        // このサイクルがフェーズ2か

  // ── INTRO → SLEEPING ─────────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setIntroEyelidClosing(true), 600)
    const t2 = setTimeout(() => setPhase('sleeping'), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // ── FALLING → SLEEPING (eyelids close, record sleep start) ───────────────
  useEffect(() => {
    if (phase !== 'falling') return
    const t = setTimeout(() => {
      sleepStartRef.current = Date.now()
      isPhase2Ref.current = sleepCount >= phase2Threshold
      setPhase('sleeping')
    }, 800)
    return () => clearTimeout(t)
  }, [phase, sleepCount, phase2Threshold])

  // ── SLEEPING: record sleep start time (for intro path too) ───────────────
  useEffect(() => {
    if (phase !== 'sleeping') { setShowWakeBtn(false); return }
    // intro path: falling doesn't run, so record here
    if (!sleepStartRef.current) {
      sleepStartRef.current = Date.now()
      isPhase2Ref.current = sleepCount >= phase2Threshold
    }
    const t = setTimeout(() => setShowWakeBtn(true), 1200)
    return () => clearTimeout(t)
  }, [phase, sleepCount, phase2Threshold])

  // ── OPENING → AWAKE ───────────────────────────────────────────────────────
  // まぶたが開き切る(3s)0.5s前にカードを出し、スライドインがちょうど3sで完了するようにする
  useEffect(() => {
    if (phase !== 'opening') return
    const t = setTimeout(() => {
      setClockEntryKey(k => k + 1)
      setPhase('awake')
    }, 2500)
    return () => clearTimeout(t)
  }, [phase])

  // ── Detect time skip ──────────────────────────────────────────────────────
  useEffect(() => {
    if (prevMinutes.current !== currentMinutes) {
      setSkipAmount(currentMinutes - prevMinutes.current)
      prevMinutes.current = currentMinutes
    }
  }, [currentMinutes])

  // ── Auto-navigate when time exceeded ──────────────────────────────────────
  useEffect(() => {
    if (phase === 'awake' && autoOver) {
      const t = setTimeout(onWakeUp, 1200)
      return () => clearTimeout(t)
    }
  }, [phase, autoOver]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMoreSleep = useCallback(() => {
    setSkipAmount(null)
    sleepStartRef.current = null // reset so sleeping effect records fresh time
    setPhase('falling')
  }, [])

  const handleOpenEyes = useCallback(() => {
    setShowWakeBtn(false)

    // 目を閉じていた実時間（秒）からゲーム内経過分を計算
    const elapsedSec = sleepStartRef.current
      ? (Date.now() - sleepStartRef.current) / 1000
      : 1
    sleepStartRef.current = null

    let skipMinutes
    if (isPhase2Ref.current) {
      // フェーズ2: 1秒 = 3〜12分（ランダム倍率）
      const mult = randomBetween(30, 120) / 10
      skipMinutes = Math.max(1, Math.round(elapsedSec * mult))
    } else {
      // フェーズ1: 1秒 = 0.2〜0.8分（安全）
      const mult = randomBetween(2, 8) / 10
      skipMinutes = Math.max(1, Math.round(elapsedSec * mult))
    }

    onSleep(skipMinutes)
    setPhase('opening')
  }, [onSleep])

  // ── Derived state ─────────────────────────────────────────────────────────
  const eyesClosed =
    phase === 'sleeping' ||
    phase === 'falling' ||
    (phase === 'intro' && introEyelidClosing)

  const eyesOpening = phase === 'opening'
  const showCard  = phase === 'awake' || phase === 'falling' || phase === 'intro'
  const showZzz   = phase === 'sleeping' // ③ zzzは sleeping のみ（opening時は非表示）

  const progressPct = Math.min(
    ((currentMinutes - 5 * 60) / (limitMinutes - 5 * 60)) * 100,
    100
  )

  return (
    <div className="game-screen">
      {/* ── Main card ── */}
      {showCard && (
        <div className={`game-card ${phase === 'intro' ? 'card-intro' : ''} ${phase === 'falling' ? 'card-falling' : ''}`}>
          <div className="limit-display">
            <span className="limit-label">リミット</span>
            <span className="limit-time">{formatTime(limitMinutes)}</span>
          </div>

          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${progressPct}%` }} />
          </div>

          <div key={clockEntryKey} className="clock-area clock-slide-in">
            <AnalogClock minutes={currentMinutes} />
            {skipAmount !== null && phase === 'awake' && (
              <div className={`skip-badge ${skipAmount >= 60 ? 'big-skip' : ''}`}>
                {skipAmount >= 60 ? `😱 ${skipAmount}分も経過！` : `+${skipAmount}分`}
              </div>
            )}
          </div>

          <div className="sleep-count">{sleepCount}回目の覚醒</div>

          {phase === 'awake' && !autoOver && (
            <div className="buttons">
              <button className="btn-sleep" onClick={handleMoreSleep}>
                もう少し寝る 😴
              </button>
              <button className="btn-wake" onClick={onWakeUp}>
                起きる 🌅
              </button>
            </div>
          )}

          {phase === 'intro' && (
            <p className="intro-text">ベッドに入る...</p>
          )}
        </div>
      )}

      {/* ③ ZZZ — sleeping フェーズのみ、まぶたの上に表示 */}
      {showZzz && (
        <div className="zzz-scene">
          <div className="zzz-container">
            <span className="zzz z1">z</span>
            <span className="zzz z2">z</span>
            <span className="zzz z3">Z</span>
          </div>
        </div>
      )}

      {/* ── 目を開けるボタン ── */}
      {phase === 'sleeping' && (
        <div className={`sleep-choices ${showWakeBtn ? 'visible' : ''}`}>
          <button className="btn-open-eyes" onClick={handleOpenEyes}>
            目を開ける 👁
          </button>
        </div>
      )}

      {/* ── Eyelids ── */}
      <div className={`eyelid eyelid-top    ${eyesClosed ? 'closed' : ''} ${eyesOpening ? 'opening' : ''}`} />
      <div className={`eyelid eyelid-bottom ${eyesClosed ? 'closed' : ''} ${eyesOpening ? 'opening' : ''}`} />
    </div>
  )
}
