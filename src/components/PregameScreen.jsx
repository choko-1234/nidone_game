import { useState } from 'react'
import AnalogClock from './AnalogClock'
import './GameScreen.css'
import './PregameScreen.css'

export default function PregameScreen({ gameState, onStart, formatTime }) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onStart, 750) // まぶたが閉じ切るのを待ってから遷移
  }

  return (
    <div className="pregame-screen">
      <div className="pregame-card">
        <p className="pregame-label">現在時刻</p>
        <div className="pregame-clock">
          <AnalogClock minutes={gameState.currentMinutes} />
        </div>
        <p className="pregame-sub">リミット　{formatTime(gameState.limitMinutes)}</p>
        <button className="pregame-btn" onClick={handleClose} disabled={closing}>
          目を閉じる 😴
        </button>
      </div>

      <div className={`eyelid eyelid-top    ${closing ? 'closed' : ''}`} />
      <div className={`eyelid eyelid-bottom ${closing ? 'closed' : ''}`} />
    </div>
  )
}
