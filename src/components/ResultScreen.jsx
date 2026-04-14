import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import './ResultScreen.css'

function getResult(diff, isOver) {
  if (isOver) {
    return {
      emoji: '😱',
      label: '遅刻！！',
      message: '寝すぎてリミットを超えてしまった…',
      color: '#ff6b6b',
    }
  }
  if (diff <= 3) {
    return {
      emoji: '🏆',
      label: 'パーフェクト！',
      message: 'ギリギリまで粘った完璧な二度寝！',
      color: '#ffd700',
    }
  }
  if (diff <= 10) {
    return {
      emoji: '😎',
      label: '超ナイス！',
      message: 'かなり粘れた。二度寝の達人！',
      color: '#a8e6a3',
    }
  }
  if (diff <= 20) {
    return {
      emoji: '😊',
      label: 'なかなか良い',
      message: 'もう少し粘れたかも？',
      color: '#a8c8ff',
    }
  }
  if (diff <= 40) {
    return {
      emoji: '😴',
      label: '余裕すぎ',
      message: 'まだまだ寝られたのに早起きすぎ！',
      color: '#c8a8ff',
    }
  }
  return {
    emoji: '🐔',
    label: '早起きすぎ',
    message: 'もっと寝てよかったのに…',
    color: '#ffb888',
  }
}

export default function ResultScreen({ gameState, formatTime, onRestart, onRanking }) {
  const { currentMinutes, limitMinutes, sleepCount, autoOver } = gameState
  const isOver = autoOver || currentMinutes > limitMinutes
  const diff = Math.abs(currentMinutes - limitMinutes)
  const result = getResult(diff, isOver)

  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error

  useEffect(() => {
    if (!isOver) return
    const src = diff <= 60 ? '/miss.mp3' : '/gameover.mp3'
    const audio = new Audio(src)
    audio.play().catch(() => {})
    return () => { audio.pause() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!name.trim()) return
    setStatus('loading')
    const { error } = await supabase.from('scores').insert({
      name: name.trim(),
      limit_minutes: limitMinutes,
      woke_minutes: currentMinutes,
      diff_minutes: diff,
      is_over: isOver,
      sleep_count: sleepCount,
    })
    setStatus(error ? 'error' : 'done')
  }

  return (
    <div className="result-screen">
      <div className="result-bg-glow" style={{ background: `radial-gradient(ellipse at center, ${result.color}22 0%, transparent 70%)` }} />

      <div className="result-card">
        <div className="result-emoji">{result.emoji}</div>
        <div className="result-label" style={{ color: result.color }}>{result.label}</div>
        <div className="result-message">{result.message}</div>

        <div className="time-compare">
          <div className="time-item">
            <div className="time-item-label">起きた時刻</div>
            <div className="time-item-value" style={{ color: isOver ? '#ff9a9a' : '#e8f0ff' }}>
              {formatTime(currentMinutes)}
            </div>
          </div>
          <div className="time-divider">vs</div>
          <div className="time-item">
            <div className="time-item-label">リミット</div>
            <div className="time-item-value" style={{ color: '#ff9a9a' }}>
              {formatTime(limitMinutes)}
            </div>
          </div>
        </div>

        <div className="score-row">
          <div className="score-block">
            <div className="score-num" style={{ color: result.color }}>
              {isOver ? `+${diff}分` : diff === 0 ? 'ぴったり' : `${diff}分前`}
            </div>
            <div className="score-desc">
              {isOver ? 'リミットオーバー' : 'リミットまでの余裕'}
            </div>
          </div>
          <div className="score-block">
            <div className="score-num">{sleepCount}回</div>
            <div className="score-desc">二度寝した回数</div>
          </div>
        </div>

        {/* ランキング登録 */}
        <div className="ranking-register">
          {status === 'done' ? (
            <p className="register-done">登録しました！</p>
          ) : (
            <>
              <input
                className="name-input"
                type="text"
                placeholder="名前を入力してランキングに登録"
                maxLength={20}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button
                className="register-btn"
                onClick={handleSubmit}
                disabled={!name.trim() || status === 'loading'}
              >
                {status === 'loading' ? '登録中...' : '登録する'}
              </button>
              {status === 'error' && <p className="register-error">登録に失敗しました</p>}
            </>
          )}
          <button className="ranking-btn" onClick={onRanking}>ランキングを見る</button>
        </div>

        <button className="restart-btn" onClick={onRestart}>
          もう一度寝る 😴
        </button>
      </div>
    </div>
  )
}
