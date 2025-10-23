import React, { useState } from 'react';

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) data = await res.json();

      if (!res.ok) {
        const message = data && data.message ? data.message : 'Login failed';
        setErr(message);
        return;
      }

      const token = data.token;
      if (token) {
        onLogin && onLogin(token);
        // fallback redirect if parent didn't handle it
        if (!onLogin) window.location.href = '/admin';
      } else {
        setErr('Login succeeded but token missing');
      }
    } catch (e) { setErr('Invalid credentials'); }
  };

  return (
    <div className="login" style={{padding:'2rem', maxWidth:420, margin:'2rem auto'}}>
      <h2>Admin Login</h2>
      <form onSubmit={submit}>
        <input name="username" placeholder="Username" value={form.username} onChange={change} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} required />
        <button type="submit">Login</button>
      </form>
      {err && <div style={{color:'crimson', marginTop:8}}>{err}</div>}
    </div>
  );
}

export default Login;
