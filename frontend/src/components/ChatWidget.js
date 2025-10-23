import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import '../styles/ChatWidget.css';

const API = process.env.REACT_APP_API_URL || '';

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(API || undefined);
    socketRef.current = socket;
    socket.on('connect', () => console.log('chat socket connected'));
    socket.on('chat:message', (m) => setMessages(prev => [...prev, m]));
    return () => { socket.disconnect(); };
  }, []);

  const send = () => {
    if (!text) return;
    const payload = { name: name || 'Visitor', message: text };
    socketRef.current.emit('chat:message', payload);
    setText('');
  };

  return (
    <div className={`chat-widget ${open ? 'open' : ''}`}>
      <div className="chat-toggle" onClick={() => setOpen(o => !o)}>{open ? '✕' : 'Chat'}</div>
      {open && (
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.map((m,i) => (
              <div key={i} className={`chat-msg ${m.sender === 'agent' ? 'agent' : 'user'}`}>
                <div className="chat-name">{m.name || (m.sender==='agent'?'Isaiah':'Visitor')}</div>
                <div className="chat-text">{m.message}</div>
              </div>
            ))}
          </div>
          <div className="chat-inputs">
            <input placeholder="Your name (optional)" value={name} onChange={e=>setName(e.target.value)} />
            <div style={{display:'flex',gap:8}}>
              <input placeholder="Type a message" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
              <button onClick={send}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
