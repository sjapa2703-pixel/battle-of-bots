import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const socket = io(import.meta.env.VITE_API_URL || '/', { autoConnect: false });

function Chat() {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      socket.connect();
      socket.on('receiveMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    return () => {
      socket.off('receiveMessage');
      if (!isOpen) {
        socket.disconnect();
      }
    };
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== '') {
      const msgData = {
        senderId: user._id,
        sender: user.nickname || user.name,
        text: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit('sendMessage', msgData);
      setCurrentMessage('');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Кнопка чата */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 0 15px var(--color-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <MessageSquare size={30} />
        </button>
      )}

      {/* Окно чата */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '350px',
          height: '500px',
          background: 'rgba(10, 10, 15, 0.95)',
          border: '1px solid var(--color-primary)',
          boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Шапка */}
          <div style={{
            background: 'var(--color-primary)',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
            fontFamily: 'var(--font-heading)'
          }}>
            <span>LIVE CHAT</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Сообщения */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.sender === (user.nickname || user.name) ? 'flex-end' : 'flex-start',
                background: msg.sender === (user.nickname || user.name) ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                padding: '10px 15px',
                borderRadius: '8px',
                border: msg.sender === (user.nickname || user.name) ? '1px solid var(--color-primary)' : '1px solid #333',
                maxWidth: '80%'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', marginBottom: '3px' }}>
                  {msg.senderId ? (
                    <Link to={`/user/${msg.senderId}`} style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
                      {msg.sender}
                    </Link>
                  ) : (
                    msg.sender
                  )}{' '}
                  <span style={{ fontSize: '0.7rem', color: '#666' }}>{msg.time}</span>
                </div>
                <div style={{ color: 'var(--color-text)' }}>{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Ввод */}
          <form onSubmit={sendMessage} style={{ padding: '15px', borderTop: '1px solid #333', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type message..." 
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #555',
                color: '#fff',
                padding: '10px',
                borderRadius: '5px'
              }}
            />
            <button type="submit" style={{
              background: 'var(--color-primary)',
              border: 'none',
              color: '#fff',
              padding: '0 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)'
            }}>SEND</button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chat;
