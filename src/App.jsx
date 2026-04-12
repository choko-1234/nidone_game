import { useState, useCallback } from 'react'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const LIMIT_OPTIONS = [
  { label: '7:00', minutes: 7 * 60 },
  { label: '7:30', minutes: 7 * 60 + 30 },
  { label: '8:00', minutes: 8 * 60 },
  { label: '8:30', minutes: 8 * 60 + 30 },
  { label: '9:00', minutes: 9 * 60 },
]

export default function App() {
  const [screen, setScreen] = useState('start')
  const [gameState, setGameState] = useState(null)

  const startGame = useCallback((limitMinutes) => {
    const startMinutes = randomBetween(5 * 60, 6 * 60 + 30)
    setGameState({
      currentMinutes: startMinutes,
      limitMinutes,
      sleepCount: 0,
      phase2Threshold: randomBetween(3, 7),
      history: [],
    })
    setScreen('game')
  }, [])

  // skipMinutes is now computed by GameScreen based on real elapsed time
  const handleSleep = useCallback((skipMinutes) => {
    setGameState(prev => {
      const newMinutes = prev.currentMinutes + skipMinutes
      const newHistory = [...prev.history, { from: prev.currentMinutes, to: newMinutes, skip: skipMinutes }]
      if (newMinutes >= prev.limitMinutes) {
        return { ...prev, currentMinutes: newMinutes, sleepCount: prev.sleepCount + 1, history: newHistory, autoOver: true }
      }
      return { ...prev, currentMinutes: newMinutes, sleepCount: prev.sleepCount + 1, history: newHistory }
    })
  }, [])

  const handleWakeUp = useCallback(() => {
    setScreen('result')
  }, [])

  const handleRestart = useCallback(() => {
    setGameState(null)
    setScreen('start')
  }, [])

  return (
    <>
      {screen === 'start' && (
        <StartScreen onStart={startGame} limitOptions={LIMIT_OPTIONS} />
      )}
      {screen === 'game' && gameState && (
        <GameScreen
          gameState={gameState}
          onSleep={handleSleep}
          onWakeUp={handleWakeUp}
          formatTime={formatTime}
        />
      )}
      {screen === 'result' && gameState && (
        <ResultScreen
          gameState={gameState}
          formatTime={formatTime}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}
