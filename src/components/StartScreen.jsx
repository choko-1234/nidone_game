import { useState } from 'react'
import './StartScreen.css'

export default function StartScreen({ onStart, limitOptions }) {
  const [selectedLimit, setSelectedLimit] = useState(limitOptions[2].minutes) // デフォルト8:00

  return (
    <div className="start-screen">
      <div className="stars">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
          />
        ))}
      </div>

      <div className="moon">🌙</div>

      <div className="start-card">
        <h1 className="title">二度寝ゲーム</h1>
        <p className="subtitle">起きなければいけない時間まで<br />どれだけ粘れるか？</p>

        <div className="rules">
          <div className="rule-item">⏰ 最初は少ししか経過しない…</div>
          <div className="rule-item">⚠️ いつからかドカンと経過するように</div>
          <div className="rule-item">🏆 リミットに最も近く起きた人が勝ち</div>
        </div>

        <div className="limit-select">
          <label>起きなければいけない時間</label>
          <div className="limit-buttons">
            {limitOptions.map(opt => (
              <button
                key={opt.minutes}
                className={`limit-btn ${selectedLimit === opt.minutes ? 'selected' : ''}`}
                onClick={() => setSelectedLimit(opt.minutes)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button className="start-btn" onClick={() => onStart(selectedLimit)}>
          寝る 😴
        </button>
      </div>
    </div>
  )
}
