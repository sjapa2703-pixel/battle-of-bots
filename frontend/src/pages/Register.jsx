import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const result = await register(name.trim(), email.trim(), password, team.trim());
    if (result.success) {
      setSuccessMsg(result.message || 'Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2 className="glitch" data-text="REGISTER" style={{ fontSize: '2rem', marginBottom: '30px' }}>REGISTER</h2>
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            placeholder="Nickname"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Team Name (Optional)"
            className="input-field"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn cta">JOIN THE LEAGUE</button>
          {error && (
            <div style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '10px', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}
          {successMsg && (
            <div style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', padding: '10px', fontSize: '0.9rem' }}>
              ✅ {successMsg}
            </div>
          )}
        </form>
        <p style={{ marginTop: '20px' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
