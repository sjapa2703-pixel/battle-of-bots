import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Trophy, Home, User, ShieldAlert, LogOut, LogIn, Sun, Moon } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-primary)',
      zIndex: 1000,
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', margin: 0, maxWidth: 'none' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo.png" alt="Battle of Bots Logo" style={{ height: '40px', objectFit: 'contain' }} />
          <span className="glitch logo-text" data-text="BATTLE OF BOTS" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
            BATTLE OF BOTS
          </span>
        </Link>
        <div className="nav-links">
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/" className={isActive('/')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Home size={18} /> <span className="nav-text">Home</span></Link>
          <Link to="/leaderboard" className={isActive('/leaderboard')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Trophy size={18} /> <span className="nav-text">Leaderboard</span></Link>
          
          {user ? (
            <>
              <Link to="/profile" className={isActive('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={18} /> <span className="nav-text">Profile</span></Link>
              {user.role === 'Administrator' && (
                <Link to="/admin" className={isActive('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-danger)' }}><ShieldAlert size={18} /> <span className="nav-text">Admin</span></Link>
              )}
              <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <LogOut size={18} /> <span className="nav-text">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><LogIn size={18} /> <span className="nav-text">Login</span></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
