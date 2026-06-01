import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import PublicProfile from './pages/PublicProfile';
import Chat from './components/Chat';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import './index.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'Administrator') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify/:token" element={<Verify />} />
            <Route path="/user/:id" element={<PublicProfile />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
          <Chat />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
