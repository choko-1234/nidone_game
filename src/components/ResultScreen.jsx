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

export default function ResultScreen({ gameState, formatTime, onRestart }) {
  const { currentMinutes, limitMinutes, sleepCount, autoOver } = gameState
  const isOver = autoOver || currentMinutes > limitMinutes
  const diff = Math.abs(currentMinutes - limitMinutes)
  const result = getResult(diff, isOver)

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

        <button className="restart-btn" onClick={onRestart}>
          もう一度寝る 😴
        </button>
      </div>
    </div>
  )
}
