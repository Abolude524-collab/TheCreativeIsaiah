import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const API = process.env.REACT_APP_API_URL || '';

function AdminChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/chat`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setMessages(await res.json());
      } catch (err) { console.error('Failed to load chat history', err); }
    })();

    const socket = io(API || undefined, { auth: { token } });
    socketRef.current = socket;
    socket.on('connect', () => { console.log('admin socket connected'); socket.emit('agent:online'); });
    socket.on('chat:message', m => setMessages(prev => [...prev, m]));

    return () => { socket.emit('agent:offline'); socket.disconnect(); };
  }, []);

  const send = () => {
    if (!text) return;
    const payload = { name: 'Isaiah', message: text };
    socketRef.current.emit('chat:message', payload);
    setText('');
  };

  return (
    <div className="admin-chat container">
      <h2>Live Chat (Admin)</h2>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        <div style={{height:400,overflow:'auto',padding:8,border:'1px solid #eee'}}>
          {messages.map((m,i) => (
            <div key={i} style={{marginBottom:8}}>
              <div style={{fontSize:12,color:'#666'}}>{m.name || (m.sender==='agent'?'Isaiah':'Visitor')} • {new Date(m.createdAt).toLocaleString()}</div>
              <div style={{background: m.sender==='agent' ? '#f4f4f4' : 'linear-gradient(90deg,#ffd700,#fff)', padding:8, borderRadius:6}}>{m.message}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8}}>
          <input style={{flex:1}} placeholder="Type a reply" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default AdminChat;
