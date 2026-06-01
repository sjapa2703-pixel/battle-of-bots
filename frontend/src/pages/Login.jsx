import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/profile');
    } else {
      alert(result.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2 className="glitch" data-text="LOGIN" style={{ fontSize: '2rem', marginBottom: '30px' }}>LOGIN</h2>
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <button type="submit" className="btn cta">ENTER SYSTEM</button>
        </form>
        <p style={{ marginTop: '20px' }}>
          New pilot? <Link to="/register" style={{ color: 'var(--color-primary)' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
