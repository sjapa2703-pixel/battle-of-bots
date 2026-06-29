import { useState, useEffect } from 'react';
import axios from 'axios';
import TournamentBracket from '../components/TournamentBracket';

const Home = () => {
  const [tournaments, setTournaments] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [viewingBracketId, setViewingBracketId] = useState(null);
  const [viewingMatches, setViewingMatches] = useState([]);

  const loadBracket = async (id) => {
    if (viewingBracketId === id) {
      setViewingBracketId(null);
      return;
    }
    try {
      const res = await axios.get(`/api/tournaments/${id}`);
      setViewingMatches(res.data.matches || []);
      setViewingBracketId(id);
    } catch (err) {
      console.error('Error loading bracket');
    }
  };

  useEffect(() => {

    const fetchData = async () => {
      try {
        const tRes = await axios.get('/api/tournaments').catch(() => ({ data: [] }));
        const nRes = await axios.get('/api/news').catch(() => ({ data: [] }));
        

        const mockTournaments = tRes.data.length ? tRes.data : [
          { _id: '1', title: 'Cyber Clash 2026', startDate: new Date(Date.now() + 86400000).toISOString(), status: 'Upcoming', streamUrl: '' }
        ];
        const mockNews = nRes.data.length ? nRes.data : [
          { _id: '1', title: 'Welcome to Battle of Bots', content: 'The ultimate robot fighting championship is here!', publishedAt: new Date().toISOString() }
        ];

        setTournaments(mockTournaments);
        setNews(mockNews);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    if (!tournaments.length) return;
    const nextTournament = tournaments.find(t => t.status === 'Upcoming');
    if (!nextTournament) return;

    const targetDate = new Date(nextTournament.startDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tournaments]);

  if (loading) return <div className="neon-card" style={{ textAlign: 'center', marginTop: '100px' }}><h2 className="glitch" data-text="LOADING...">LOADING...</h2></div>;

  const nextTournament = tournaments.find(t => t.status === 'Upcoming');
  const liveTournament = tournaments.find(t => t.status === 'Live');

  return (
    <div>
      <section style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 className="glitch" data-text="BATTLE OF BOTS" style={{ fontSize: '3rem', marginBottom: '10px' }}>BATTLE OF BOTS</h1>
        <p style={{ color: 'var(--color-secondary)' }}>THE ULTIMATE ROBOT COMBAT LEAGUE</p>
      </section>

      {/* Стрим или Таймер */}
      <section className="neon-card" style={{ marginBottom: '40px', textAlign: 'center' }}>
        {liveTournament && liveTournament.streamUrl ? (
          <div>
            <h2 style={{ color: 'var(--color-cta)', marginBottom: '20px' }}>🔴 LIVE NOW: {liveTournament.title}</h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe 
                src={liveTournament.streamUrl.replace('watch?v=', 'embed/')} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '2px solid var(--color-cta)' }}
                allowFullScreen
                title="Live Stream"
              ></iframe>
            </div>
          </div>
        ) : nextTournament ? (
          <div>
            <h2 style={{ marginBottom: '20px' }}>NEXT TOURNAMENT: {nextTournament.title}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
              <div>{timeLeft.days}d</div>
              <div>{timeLeft.hours}h</div>
              <div>{timeLeft.minutes}m</div>
              <div>{timeLeft.seconds}s</div>
            </div>
            <div style={{ marginTop: '30px' }}>
              <a href="https://forms.gle/opzH5SHSQwCL1hry5" target="_blank" rel="noreferrer" className="btn cta">REGISTER BOT</a>
            </div>
          </div>
        ) : (
          <h2>No upcoming tournaments at the moment.</h2>
        )}
      </section>

      <div className="grid grid-2">
        {/* Лента новостей */}
        <section>
          <h2 style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px', marginBottom: '20px' }}>LATEST NEWS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {news.map(item => (
              <div key={item._id} className="neon-card" style={{ padding: '15px' }}>
                <h3 style={{ color: 'var(--color-secondary)' }}>{item.title}</h3>
                <small>{new Date(item.publishedAt).toLocaleDateString()}</small>
                <p style={{ marginTop: '10px' }}>{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Расписание */}
        <section>
          <h2 style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px', marginBottom: '20px' }}>SCHEDULE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tournaments.map(item => (
              <div key={item._id} className="neon-card" style={{ padding: '15px', borderLeft: item.status === 'Live' ? '4px solid var(--color-cta)' : '1px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3>{item.title}</h3>
                  <button 
                    onClick={() => loadBracket(item._id)} 
                    className="btn" 
                    style={{ padding: '8px 16px', fontSize: '0.9rem', width: '100%', maxWidth: '200px' }}
                  >
                    {viewingBracketId === item._id ? 'Hide Bracket' : '🏆 View Bracket'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <span>{new Date(item.startDate).toLocaleDateString()}</span>
                  <span style={{ color: item.status === 'Live' ? 'var(--color-cta)' : 'var(--color-text)' }}>{item.status}</span>
                </div>
                {viewingBracketId === item._id && (
                  <div style={{ marginTop: '20px', overflowX: 'auto', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
                    <TournamentBracket matches={viewingMatches} adminMode={false} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
