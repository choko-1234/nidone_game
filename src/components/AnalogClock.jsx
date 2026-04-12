export default function AnalogClock({ minutes }) {
  const totalHours = minutes / 60
  const mins = minutes % 60

  // Degrees from 12 o'clock, clockwise
  const hourAngle = (totalHours % 12) * 30   // 30° per hour
  const minAngle  = (mins / 60) * 360         // 360° per revolution

  const toXY = (deg, r) => {
    const rad = (deg - 90) * Math.PI / 180
    return { x: 100 + r * Math.cos(rad), y: 100 + r * Math.sin(rad) }
  }

  const hourTip = toXY(hourAngle, 50)
  const minTip  = toXY(minAngle,  68)

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const isHour = i % 5 === 0
    const p1 = toXY((i / 60) * 360, isHour ? 80 : 87)
    const p2 = toXY((i / 60) * 360, 93)
    return { p1, p2, isHour }
  })

  const labels = [
    [0, '12'], [90, '3'], [180, '6'], [270, '9'],
  ]

  return (
    <svg viewBox="0 0 200 200" width="200" height="200" className="analog-clock">
      <defs>
        <radialGradient id="face" cx="50%" cy="40%" r="65%">
          <stop offset="0%"   stopColor="#1c1c42" />
          <stop offset="100%" stopColor="#08081e" />
        </radialGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ring */}
      <circle cx="100" cy="100" r="97" fill="none" stroke="rgba(168,200,255,0.12)" strokeWidth="1" />

      {/* Clock face */}
      <circle cx="100" cy="100" r="95" fill="url(#face)" />

      {/* Inner ring glow */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(168,200,255,0.18)" strokeWidth="1.5" />

      {/* Tick marks */}
      {ticks.map(({ p1, p2, isHour }, i) => (
        <line
          key={i}
          x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={isHour ? 'rgba(168,200,255,0.65)' : 'rgba(168,200,255,0.18)'}
          strokeWidth={isHour ? 2.2 : 1}
        />
      ))}

      {/* Hour labels */}
      {labels.map(([deg, label]) => {
        const p = toXY(deg, 67)
        return (
          <text
            key={label}
            x={p.x} y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
            fill="rgba(168,200,255,0.45)"
            fontFamily="system-ui, sans-serif"
          >
            {label}
          </text>
        )
      })}

      {/* Hour hand */}
      <line
        x1="100" y1="105"
        x2={hourTip.x} y2={hourTip.y}
        stroke="#e8f0ff"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* Minute hand */}
      <line
        x1="100" y1="108"
        x2={minTip.x} y2={minTip.y}
        stroke="#a8c8ff"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* Center cap */}
      <circle cx="100" cy="100" r="7" fill="#1c1c42" />
      <circle cx="100" cy="100" r="5" fill="#a8c8ff" filter="url(#softglow)" />
    </svg>
  )
}
