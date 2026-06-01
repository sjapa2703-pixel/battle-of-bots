import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Verify() {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying your email...');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const res = await axios.get(`/api/auth/verify/${token}`);
        setMessage(res.data.message);
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
      }
    };
    verifyAccount();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 className="glitch" data-text="ACCOUNT VERIFICATION" style={{ fontSize: '2rem', marginBottom: '20px' }}>ACCOUNT VERIFICATION</h2>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
        <p style={{ color: success ? '#4ade80' : '#f87171', fontSize: '1.2rem', marginBottom: '20px' }}>
          {message}
        </p>
        {success && <p>Redirecting to login...</p>}
        {!success && (
          <Link to="/login" className="btn" style={{ marginTop: '20px' }}>BACK TO LOGIN</Link>
        )}
      </div>
    </div>
  );
}

export default Verify;
