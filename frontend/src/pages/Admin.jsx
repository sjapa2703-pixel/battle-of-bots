import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('tournaments');

  const [tournaments, setTournaments] = useState([]);
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);


  const [tForm, setTForm] = useState({ id: null, title: '', startDate: '', status: 'Upcoming', streamUrl: '' });
  const [nForm, setNForm] = useState({ id: null, title: '', content: '' });
  const [uForm, setUForm] = useState({ id: null, nickname: '', role: 'User', wins: 0, losses: 0 });

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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <button className={`btn ${activeTab === 'tournaments' ? 'cta' : 'ghost'}`} onClick={() => setActiveTab('tournaments')}>Schedule</button>
        <button className={`btn ${activeTab === 'news' ? 'cta' : 'ghost'}`} onClick={() => setActiveTab('news')}>News</button>
        <button className={`btn ${activeTab === 'users' ? 'cta' : 'ghost'}`} onClick={() => setActiveTab('users')}>Users</button>
      </div>

      <div className="neon-card" style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid var(--color-cta)' }}>
        
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
            <hr style={{ borderColor: '#333', marginBottom: '20px' }} />
            {tournaments.map(t => (
              <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #222' }}>
                <div>
                  <strong>{t.title}</strong> - {t.status} <br/>
                  <small>{new Date(t.startDate).toLocaleString()}</small>
                </div>
                <div>
                  <button onClick={() => setTForm({ id: t._id, title: t.title, startDate: t.startDate.substring(0,16), status: t.status, streamUrl: t.streamUrl || '' })} style={{ marginRight: '10px', background: 'none', color: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleTDelete(t._id)} style={{ background: 'none', color: 'red', border: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
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
