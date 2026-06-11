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
      .eq('is_over', false)
      .then(({ data }) => {
        const sorted = (data ?? [])
          .slice()
          .sort(
            (a, b) =>
              a.diff_minutes + a.sleep_count - (b.diff_minutes + b.sleep_count)
          )
          .slice(0, 20)
        setScores(sorted)
        setLoading(false)
      })
  }, [])

  return (
    <div className="ranking-screen">
      <div className="ranking-card">
        <h2 className="ranking-title">ランキング</h2>
        <p className="ranking-sub">リミットに近い + 二度寝回数が少ないほど上位</p>
        <div style={{ display: 'flex' }}>
          <p className="ranking-explain" style={{ whiteSpace: 'nowrap', marginRight: 26 }}>順位</p>
          <p className="ranking-explain" style={{ whiteSpace: 'nowrap', marginRight: 150 }}>氏名</p>
          <p className="ranking-explain" style={{ whiteSpace: 'nowrap', marginRight: 24, fontSize: 14 }}>リミット</p>
          <p className="ranking-explain" style={{ whiteSpace: 'nowrap', marginRight: 24 }}>何分前</p>
          <p className="ranking-explain" style={{ whiteSpace: 'nowrap' }}>寝た回数</p>
        </div>

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
                  <span>{formatTime(s.limit_minutes)}</span>
                  <span>{s.diff_minutes}分前</span>
                  <span>{s.sleep_count}回</span>
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
