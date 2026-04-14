import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import './RankingScreen.css'

export default function RankingScreen({ onBack, formatTime }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('scores')
      .select('*')
      .order('diff_minutes', { ascending: true })
      .eq('is_over', false)
      .limit(20)
      .then(({ data }) => {
        setScores(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="ranking-screen">
      <div className="ranking-card">
        <h2 className="ranking-title">ランキング</h2>
        <p className="ranking-sub">リミットに近いほど上位</p>

        {loading ? (
          <p className="ranking-loading">読み込み中...</p>
        ) : scores.length === 0 ? (
          <p className="ranking-loading">まだ記録がありません</p>
        ) : (
          <ol className="ranking-list">
            {scores.map((s, i) => (
              <li key={s.id} className={`ranking-item ${i < 3 ? `top${i + 1}` : ''}`}>
                <span className="rank-num">{i + 1}</span>
                <span className="rank-name">{s.name}</span>
                <span className="rank-detail">
                  リミット {formatTime(s.limit_minutes)}　{s.diff_minutes}分前　{s.sleep_count}回
                </span>
              </li>
            ))}
          </ol>
        )}

        <button className="back-btn" onClick={onBack}>戻る</button>
      </div>
    </div>
  )
}
