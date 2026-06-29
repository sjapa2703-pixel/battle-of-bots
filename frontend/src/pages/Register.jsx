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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(name, email, password, team);
    if (result.success) {
      alert(result.message || 'Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } else {
      alert(result.message || 'Registration failed.');
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
        </form>
        <p style={{ marginTop: '20px' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
