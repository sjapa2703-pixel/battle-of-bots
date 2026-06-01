import { useState, useContext, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || user.name);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setAvatarUrl(data.url);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Upload failed');
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put('/api/auth/profile', { nickname, avatarUrl });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <div>
      <section style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 className="glitch" data-text="COMMANDER PROFILE" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>COMMANDER PROFILE</h1>
      </section>

      <div className="grid grid-2">
        {/* Инфо профиля */}
        <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px solid var(--color-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', background: 'rgba(124, 58, 237, 0.2)', overflow: 'hidden' }}>
            {avatarUrl || user?.avatarUrl ? (
              <img src={avatarUrl || user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserIcon size={64} color="var(--color-primary)" />
            )}
          </div>
          
          {isEditing ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text"
                placeholder="Nickname"
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                style={{ textAlign: 'center' }}
              />
              <label style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', textAlign: 'center' }}>Upload Avatar:</label>
              <input 
                type="file" 
                onChange={uploadFileHandler}
                accept="image/png, image/jpeg, image/jpg"
                style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
              />
              <button className="btn cta" onClick={handleSave}>SAVE PROFILE</button>
              <button className="btn" onClick={() => setIsEditing(false)}>CANCEL</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--color-secondary)', fontSize: '2rem' }}>{user?.nickname || user?.name}</h2>
              <p style={{ margin: '10px 0' }}>Role: {user?.role || 'Commander'}</p>
              <button className="btn" onClick={() => setIsEditing(true)}>EDIT PROFILE</button>
            </div>
          )}
        </div>

        {/* Боевая статистика */}
        <div className="neon-card">
          <h2 style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px', marginBottom: '20px' }}>COMBAT RECORD</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '30px' }}>
            <div>
              <div style={{ fontSize: '3rem', color: '#4ade80', fontFamily: 'var(--font-heading)' }}>{user?.wins || 0}</div>
              <div>WINS</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', color: '#f87171', fontFamily: 'var(--font-heading)' }}>{user?.losses || 0}</div>
              <div>LOSSES</div>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '15px' }}>Recent Matches</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px', border: '1px solid rgba(74, 222, 128, 0.5)', background: 'rgba(74, 222, 128, 0.1)' }}>
              WIN vs SteelTitan (Cyber Clash)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
