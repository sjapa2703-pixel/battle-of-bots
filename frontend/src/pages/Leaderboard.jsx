import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="neon-card" style={{ textAlign: 'center', marginTop: '100px' }}><h2 className="glitch" data-text="LOADING...">LOADING...</h2></div>;

  return (
    <div>
      <section style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 className="glitch" data-text="GLOBAL RANKINGS" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>GLOBAL RANKINGS</h1>
        <p style={{ color: 'var(--color-secondary)' }}>TOP 10 COMMANDERS</p>
      </section>

      <div className="neon-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-primary)' }}>
              <th style={{ padding: '15px' }}>Rank</th>
              <th style={{ padding: '15px' }}>Commander</th>
              <th style={{ padding: '15px' }}>Wins</th>
              <th style={{ padding: '15px' }}>Losses</th>
              <th style={{ padding: '15px' }}>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: 'var(--color-secondary)' }}>No commanders registered yet.</td>
              </tr>
            ) : (
              users.map((user, index) => {
                const total = user.wins + user.losses;
                const winRate = total === 0 ? 0 : Math.round((user.wins / total) * 100);
                
                return (
                  <tr key={user._id} style={{ borderBottom: '1px solid rgba(124, 58, 237, 0.2)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px', color: index < 3 ? 'var(--color-cta)' : 'var(--color-text)', fontWeight: 'bold' }}>
                      {index === 0 && <Trophy size={18} style={{ marginRight: '5px', verticalAlign: 'middle' }}/>}
                      #{index + 1}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <Link to={`/user/${user._id}`} style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
                        {user.nickname}
                      </Link>
                    </td>
                    <td style={{ padding: '15px', color: '#4ade80' }}>{user.wins}</td>
                    <td style={{ padding: '15px', color: '#f87171' }}>{user.losses}</td>
                    <td style={{ padding: '15px' }}>{winRate}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
