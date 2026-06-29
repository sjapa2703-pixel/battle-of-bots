import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import TournamentBracket from '../components/TournamentBracket';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('tournaments');

  const [tournaments, setTournaments] = useState([]);
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);


  const [tForm, setTForm] = useState({ id: null, title: '', startDate: '', status: 'Upcoming', streamUrl: '' });
  const [nForm, setNForm] = useState({ id: null, title: '', content: '' });
  const [uForm, setUForm] = useState({ id: null, nickname: '', role: 'User', wins: 0, losses: 0 });

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentMatches, setTournamentMatches] = useState([]);
  const [matchEdit, setMatchEdit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authConfig = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const [tRes, nRes, uRes] = await Promise.all([
        axios.get('/api/tournaments'),
        axios.get('/api/news'),
        axios.get('/api/admin/users', authConfig).catch(() => ({ data: [] }))
      ]);
      setTournaments(tRes.data || []);
      setNews(nRes.data || []);
      setUsers(uRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });


  const handleTSave = async (e) => {
    e.preventDefault();
    try {
      if (tForm.id) {
        await axios.put(`/api/admin/tournaments/${tForm.id}`, tForm, getAuthConfig());
        alert('Tournament updated!');
      } else {
        await axios.post('/api/admin/tournaments', tForm, getAuthConfig());
        alert('Tournament created!');
      }
      setTForm({ id: null, title: '', startDate: '', status: 'Upcoming', streamUrl: '' });
      fetchData();
    } catch (error) {
      alert('Error saving tournament');
    }
  };

  const handleTDelete = async (id) => {
    if (!window.confirm('Delete this tournament?')) return;
    try {
      await axios.delete(`/api/admin/tournaments/${id}`, getAuthConfig());
      fetchData();
    } catch (error) {
      alert('Error deleting tournament');
    }
  };

  const loadBracket = async (id) => {
    try {
      const res = await axios.get(`/api/tournaments/${id}`);
      setSelectedTournament(res.data.tournament);
      setTournamentMatches(res.data.matches || []);
      setMatchEdit(null);
    } catch (error) {
      alert('Error loading bracket');
    }
  };

  const handleGenerateBracket = async (id) => {
    if (!window.confirm('This will clear existing matches and generate a new bracket. Proceed?')) return;
    try {
      await axios.post(`/api/admin/tournaments/${id}/generate`, {}, getAuthConfig());
      loadBracket(id);
    } catch (error) {
      alert('Error generating bracket');
    }
  };

  const handleMatchSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/matches/${matchEdit._id}`, matchEdit, getAuthConfig());
      alert('Match updated');
      setMatchEdit(null);
      loadBracket(selectedTournament._id);
    } catch (error) {
      alert('Error updating match');
    }
  };

  const handleNSave = async (e) => {
    e.preventDefault();
    try {
      if (nForm.id) {
        await axios.put(`/api/admin/news/${nForm.id}`, nForm, getAuthConfig());
        alert('News updated!');
      } else {
        await axios.post('/api/admin/news', nForm, getAuthConfig());
        alert('News created!');
      }
      setNForm({ id: null, title: '', content: '' });
      fetchData();
    } catch (error) {
      alert('Error saving news');
    }
  };

  const handleNDelete = async (id) => {
    if (!window.confirm('Delete this news?')) return;
    try {
      await axios.delete(`/api/admin/news/${id}`, getAuthConfig());
      fetchData();
    } catch (error) {
      alert('Error deleting news');
    }
  };


  const handleUSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${uForm.id}`, uForm, getAuthConfig());
      alert('User updated!');
      setUForm({ id: null, nickname: '', role: 'User', wins: 0, losses: 0 });
      fetchData();
    } catch (error) {
      alert('Error saving user');
    }
  };

  const handleUDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, getAuthConfig());
      fetchData();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  return (
    <div>
      <section style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 className="glitch" data-text="SYSTEM OVERRIDE" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>SYSTEM OVERRIDE</h1>
        <p style={{ color: 'var(--color-cta)' }}>ADMINISTRATOR ACCESS ONLY</p>
      </section>

      {/* TABS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button className={`btn ${activeTab === 'tournaments' ? 'cta' : 'ghost'}`} onClick={() => setActiveTab('tournaments')}>Schedule</button>
        <button className={`btn ${activeTab === 'brackets' ? 'cta' : 'ghost'}`} onClick={() => setActiveTab('brackets')}>🏆 Brackets</button>
        <button className={`btn ${activeTab === 'news' ? 'cta' : 'ghost'}`} onClick={() => setActiveTab('news')}>News</button>
        <button className={`btn ${activeTab === 'users' ? 'cta' : 'ghost'}`} onClick={() => setActiveTab('users')}>Users</button>
      </div>

      <div className="neon-card" style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid var(--color-cta)' }}>
        
        {/* TOURNAMENTS TAB */}
        {activeTab === 'tournaments' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-cta)' }}>Manage Tournaments (Timer)</h2>
            <form onSubmit={handleTSave} style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input type="text" placeholder="Title" value={tForm.title} onChange={e => setTForm({...tForm, title: e.target.value})} required style={{flex: 1, marginBottom: 0}}/>
                <input type="datetime-local" value={tForm.startDate} onChange={e => setTForm({...tForm, startDate: e.target.value})} required style={{flex: 1, marginBottom: 0}} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <select value={tForm.status} onChange={e => setTForm({...tForm, status: e.target.value})} style={{flex: 1, marginBottom: 0}}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Live">Live</option>
                  <option value="Completed">Completed</option>
                </select>
                <input type="text" placeholder="YouTube Stream URL" value={tForm.streamUrl} onChange={e => setTForm({...tForm, streamUrl: e.target.value})} style={{flex: 1, marginBottom: 0}}/>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn cta" style={{flex: 1}}>{tForm.id ? 'UPDATE' : 'CREATE'}</button>
                {tForm.id && <button type="button" className="btn ghost" onClick={() => setTForm({ id: null, title: '', startDate: '', status: 'Upcoming', streamUrl: '' })}>CANCEL</button>}
              </div>
            </form>
            <hr style={{ borderColor: 'var(--color-card-border)', marginBottom: '20px' }} />
            {tournaments.map(t => (
              <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--color-card-border)' }}>
                <div>
                  <strong>{t.title}</strong> - {t.status} <br/>
                  <small>{new Date(t.startDate).toLocaleString()}</small>
                </div>
                <div>
                  <button onClick={() => setTForm({ id: t._id, title: t.title, startDate: t.startDate.substring(0,16), status: t.status, streamUrl: t.streamUrl || '' })} style={{ marginRight: '10px', background: 'none', color: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleTDelete(t._id)} style={{ background: 'none', color: 'var(--color-cta)', border: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BRACKETS TAB */}
        {activeTab === 'brackets' && (
          <div>
            {!selectedTournament ? (
              <>
                <h2 style={{ marginBottom: '20px', color: 'var(--color-cta)' }}>Select a Tournament to Manage Bracket</h2>
                {tournaments.length === 0 && <p>No tournaments found. Create one in the Schedule tab first.</p>}
                {tournaments.map(t => (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--color-card-border)', alignItems: 'center' }}>
                    <div>
                      <strong>{t.title}</strong> - {t.status}
                    </div>
                    <div>
                      <button onClick={() => loadBracket(t._id)} style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>⚙ Manage Bracket</button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div>
                <button onClick={() => setSelectedTournament(null)} className="btn ghost" style={{ marginBottom: '20px' }}>&larr; Back to Tournaments List</button>
                <h2 style={{ marginBottom: '20px', color: 'var(--color-cta)' }}>Bracket Editor: {selectedTournament.title}</h2>
                
                <div style={{ marginBottom: '30px', padding: '15px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--color-card-border)', borderRadius: '8px' }}>
                  <h3>1. Select Participants ({selectedTournament.participants?.length || 0})</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                    {users.map(u => {
                      const isSelected = selectedTournament.participants?.includes(u._id);
                      return (
                        <button 
                          key={u._id}
                          onClick={async () => {
                            let newParticipants = selectedTournament.participants || [];
                            if (isSelected) {
                              newParticipants = newParticipants.filter(id => id !== u._id);
                            } else {
                              newParticipants = [...newParticipants, u._id];
                            }
                            try {
                              await axios.put(`/api/admin/tournaments/${selectedTournament._id}`, { participants: newParticipants }, getAuthConfig());
                              setSelectedTournament({...selectedTournament, participants: newParticipants});
                            } catch (e) {
                              alert('Error updating participants');
                            }
                          }}
                          style={{
                            padding: '5px 10px',
                            background: isSelected ? 'var(--color-primary)' : 'transparent',
                            color: isSelected ? '#fff' : 'var(--color-text)',
                            border: `1px solid ${isSelected ? 'var(--color-primary)' : '#555'}`,
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {u.nickname} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--color-card-border)', borderRadius: '8px' }}>
                  <h3>2. Generate Bracket Layout</h3>
                  <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>Warning: This will overwrite any existing matches for this tournament!</p>
                  <button onClick={() => handleGenerateBracket(selectedTournament._id)} className="btn cta">Auto-Generate Matches</button>
                </div>
                
                {matchEdit && (
                  <form onSubmit={handleMatchSave} style={{ marginBottom: '20px', padding: '20px', border: '2px solid var(--color-primary)', borderRadius: '8px', background: 'var(--color-card-bg)' }}>
                    <h3 style={{ color: 'var(--color-primary)', marginBottom: '15px' }}>3. Edit Match {matchEdit.matchNumber} (Round {matchEdit.round})</h3>
                    
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Participant 1</label>
                        <select 
                          value={matchEdit.participant1Id ? (typeof matchEdit.participant1Id === 'object' ? matchEdit.participant1Id._id : matchEdit.participant1Id) : ''} 
                          onChange={e => setMatchEdit({...matchEdit, participant1Id: e.target.value})} 
                          style={{ width: '100%' }}
                        >
                          <option value="">-- None --</option>
                          {selectedTournament.participants?.map(pid => {
                            const u = users.find(user => user._id === pid);
                            if (!u) return null;
                            return <option key={u._id} value={u._id}>{u.nickname}</option>;
                          })}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Participant 2</label>
                        <select 
                          value={matchEdit.participant2Id ? (typeof matchEdit.participant2Id === 'object' ? matchEdit.participant2Id._id : matchEdit.participant2Id) : ''} 
                          onChange={e => setMatchEdit({...matchEdit, participant2Id: e.target.value})} 
                          style={{ width: '100%' }}
                        >
                          <option value="">-- None --</option>
                          {selectedTournament.participants?.map(pid => {
                            const u = users.find(user => user._id === pid);
                            if (!u) return null;
                            return <option key={u._id} value={u._id}>{u.nickname}</option>;
                          })}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Match Winner</label>
                        <select value={matchEdit.winnerId || ''} onChange={e => setMatchEdit({...matchEdit, winnerId: e.target.value})} style={{ width: '100%' }}>
                          <option value="">-- Select Winner --</option>
                          {matchEdit.participant1Id && (
                            <option value={typeof matchEdit.participant1Id === 'object' ? matchEdit.participant1Id._id : matchEdit.participant1Id}>
                              {typeof matchEdit.participant1Id === 'object' ? matchEdit.participant1Id.nickname : users.find(u => u._id === matchEdit.participant1Id)?.nickname}
                            </option>
                          )}
                          {matchEdit.participant2Id && (
                            <option value={typeof matchEdit.participant2Id === 'object' ? matchEdit.participant2Id._id : matchEdit.participant2Id}>
                              {typeof matchEdit.participant2Id === 'object' ? matchEdit.participant2Id.nickname : users.find(u => u._id === matchEdit.participant2Id)?.nickname}
                            </option>
                          )}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Match Status</label>
                        <select value={matchEdit.status} onChange={e => setMatchEdit({...matchEdit, status: e.target.value})} style={{ width: '100%' }}>
                          <option value="Scheduled">Scheduled</option>
                          <option value="InProgress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn cta" style={{flex: 1}}>SAVE MATCH CHANGES</button>
                      <button type="button" className="btn ghost" onClick={() => setMatchEdit(null)}>CANCEL</button>
                    </div>
                  </form>
                )}

                <div style={{ overflowX: 'auto', background: 'var(--color-bg)', border: '1px solid var(--color-card-border)', padding: '20px', borderRadius: '8px' }}>
                  <TournamentBracket 
                    matches={tournamentMatches} 
                    adminMode={true} 
                    onMatchClick={(m) => setMatchEdit(m)} 
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-cta)' }}>Manage News</h2>
            <form onSubmit={handleNSave} style={{ marginBottom: '40px' }}>
              <input type="text" placeholder="News Title" value={nForm.title} onChange={e => setNForm({...nForm, title: e.target.value})} required style={{width: '100%', marginBottom: '15px'}}/>
              <textarea placeholder="Content..." value={nForm.content} onChange={e => setNForm({...nForm, content: e.target.value})} required style={{width: '100%', marginBottom: '15px', height: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid #555', color: '#fff', padding: '10px'}}/>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn cta" style={{flex: 1}}>{nForm.id ? 'UPDATE NEWS' : 'POST NEWS'}</button>
                {nForm.id && <button type="button" className="btn ghost" onClick={() => setNForm({ id: null, title: '', content: '' })}>CANCEL</button>}
              </div>
            </form>
            <hr style={{ borderColor: '#333', marginBottom: '20px' }} />
            {news.map(n => (
              <div key={n._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #222' }}>
                <div>
                  <strong>{n.title}</strong><br/>
                  <small>{new Date(n.publishedAt).toLocaleDateString()}</small>
                </div>
                <div>
                  <button onClick={() => setNForm({ id: n._id, title: n.title, content: n.content })} style={{ marginRight: '10px', background: 'none', color: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleNDelete(n._id)} style={{ background: 'none', color: 'red', border: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-cta)' }}>Moderate Users</h2>
            {uForm.id && (
              <form onSubmit={handleUSave} style={{ marginBottom: '40px', padding: '15px', border: '1px dashed var(--color-primary)' }}>
                <h3 style={{ marginBottom: '15px' }}>Editing: {uForm.nickname}</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input type="text" value={uForm.nickname} onChange={e => setUForm({...uForm, nickname: e.target.value})} placeholder="Nickname"/>
                  <select value={uForm.role} onChange={e => setUForm({...uForm, role: e.target.value})}>
                    <option value="User">User</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <label>Wins: <input type="number" value={uForm.wins} onChange={e => setUForm({...uForm, wins: parseInt(e.target.value)})} style={{width: '60px'}}/></label>
                  <label>Losses: <input type="number" value={uForm.losses} onChange={e => setUForm({...uForm, losses: parseInt(e.target.value)})} style={{width: '60px'}}/></label>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn cta" style={{flex: 1}}>SAVE USER</button>
                  <button type="button" className="btn ghost" onClick={() => setUForm({ id: null, nickname: '', role: 'User', wins: 0, losses: 0 })}>CANCEL</button>
                </div>
              </form>
            )}

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-primary)' }}>
                  <th style={{ padding: '10px' }}>Nickname</th>
                  <th>Role</th>
                  <th>Stats (W/L)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '10px' }}>{u.nickname}</td>
                    <td><span style={{ color: u.role === 'Administrator' ? 'var(--color-cta)' : '#aaa' }}>{u.role}</span></td>
                    <td>{u.wins} / {u.losses}</td>
                    <td>
                      <button onClick={() => setUForm({ id: u._id, nickname: u.nickname, role: u.role, wins: u.wins, losses: u.losses })} style={{ marginRight: '10px', background: 'none', color: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleUDelete(u._id)} disabled={u._id === user._id} style={{ background: 'none', color: u._id === user._id ? '#555' : 'red', border: 'none', cursor: u._id === user._id ? 'not-allowed' : 'pointer' }}>Ban</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
