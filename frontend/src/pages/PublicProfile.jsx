import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Trophy, XCircle, Calendar } from 'lucide-react';

const PublicProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${id}`);
        setProfileData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2 className="glitch" data-text="LOADING...">LOADING...</h2></div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}><h2>{error}</h2><Link to="/" className="btn ghost">Go Home</Link></div>;
  if (!profileData || !profileData.user) return null;

  const { user, matches } = profileData;

  const winRate = user.wins + user.losses > 0 
    ? Math.round((user.wins / (user.wins + user.losses)) * 100) 
    : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <section className="neon-card" style={{ display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={60} color="var(--color-primary)" />
          )}
        </div>
        <div>
          <h1 className="glitch" data-text={user.nickname || user.name} style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>{user.nickname || user.name}</h1>
          <p style={{ color: 'var(--color-secondary)', fontSize: '1.2rem', marginBottom: '15px' }}>{user.role}</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy color="var(--color-primary)" /> <span style={{ fontSize: '1.2rem' }}>Wins: {user.wins}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle color="var(--color-cta)" /> <span style={{ fontSize: '1.2rem' }}>Losses: {user.losses}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', color: '#888' }}>Win Rate: {winRate}%</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px', marginBottom: '20px' }}>Match History</h2>
        {matches && matches.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {matches.map(m => {
              const isWinner = m.winnerId === user._id;
              const resultColor = isWinner ? 'var(--color-primary)' : 'var(--color-cta)';
              return (
                <div key={m._id} className="neon-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${resultColor}` }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{m.tournamentId?.title || 'Unknown Tournament'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
                      <Calendar size={16} /> {new Date(m.scheduledAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      color: resultColor, 
                      fontWeight: 'bold', 
                      fontSize: '1.2rem',
                      textShadow: `0 0 10px ${resultColor}` 
                    }}>
                      {isWinner ? 'VICTORY' : 'DEFEAT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>No matches played yet.</p>
        )}
      </section>
    </div>
  );
};

export default PublicProfile;
