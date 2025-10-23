import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';


function AdminDashboard() {
  const [tab, setTab] = useState('upload');
  const [testimonials, setTestimonials] = useState([]);
  const [testForm, setTestForm] = useState({ author: '', role: '', quote: '', avatar: null });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ author: '', role: '', quote: '', avatar: null });
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [form, setForm] = useState({ title: '', category: '', description: '', images: [] });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');

  // Resolve API base: prefer env var, but when running CRA dev server on :3000
  // use explicit backend URL so proxy/misconfiguration doesn't send requests to :3000
  const API = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:5000' : '');

  useEffect(() => { if (token) { refreshAll(); fetchUnreadCount(); } }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API}/api/messages/unread-count`, { headers });
      if (!res.ok) return console.error('Unread count fetch failed', await res.text());
      const json = await res.json();
      setUnreadCount(json.unread || 0);
    } catch (e) { console.error('Error fetching unread count', e); }
  };

  // helper: parse JSON safely and return text on non-json for debugging
  async function parseJsonSafe(res) {
    const ct = res.headers.get('content-type') || '';
    const text = await res.text();
    if (ct.includes('application/json')) {
      try { return JSON.parse(text); } catch (e) { throw new Error('Invalid JSON: ' + e.message); }
    }
    throw new Error('Expected JSON but received: ' + text.slice(0, 300));
  }

  const refreshAll = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [pRes, mRes] = await Promise.all([
        fetch(`${API}/api/projects`, { headers }),
        fetch(`${API}/api/messages`, { headers })
      ]);
      // fetch categories (public)
      const cRes = await fetch(`${API}/api/categories`);
  const tRes = await fetch(`${API}/api/testimonials`);
      if (pRes.ok) setProjects(await parseJsonSafe(pRes)); else console.error('Projects fetch failed', await pRes.text());
      if (mRes.ok) setMessages(await parseJsonSafe(mRes)); else console.error('Messages fetch failed', await mRes.text());
      if (cRes.ok) setCategories(await cRes.json()); else console.error('Categories fetch failed', await cRes.text());
      if (tRes.ok) setTestimonials(await tRes.json()); else console.error('Testimonials fetch failed', await tRes.text());
    } catch (err) {
      console.error('Network error while refreshing admin data', err);
      alert('Network error: could not reach backend. Make sure backend is running on http://localhost:5000');
    }
  };

  // unreadCount is fetched from the server to avoid fetching messages repeatedly

  const handleUpload = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('category', form.category);
    data.append('description', form.description);
    for (let img of form.images) data.append('images', img);
    try {
      const res = await fetch(`${API}/api/projects`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error('Upload failed: ' + txt.slice(0, 300));
      }
      await parseJsonSafe(res); // ensure JSON
      setForm({ title: '', category: '', description: '', images: [] });
      await refreshAll();
    } catch (err) {
      console.error('Upload error', err);
      if (err.message && err.message.includes('Failed to fetch')) {
        alert('Network error: could not reach backend. Is it running on http://localhost:5000 ?');
      } else {
        alert('Upload error: ' + err.message);
      }
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    const res = await fetch(`${API}/api/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) await refreshAll(); else { console.error('Delete failed', await res.text()); alert('Delete failed'); }
  };

  const markAsRead = async (id) => {
    const res = await fetch(`${API}/api/messages/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (res.ok) await refreshAll(); else { console.error('Mark read failed', await res.text()); alert('Action failed'); }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        <button onClick={() => setTab('upload')}>Upload Project</button>
        <button onClick={() => setTab('manage')}>Manage Projects</button>
        <button onClick={async () => {
            setTab('messages');
            // when opening messages, mark unread messages as read (optimistic)
            try {
              // fetch the current messages only when opening the tab
              const headers = { Authorization: `Bearer ${token}` };
              const mRes = await fetch(`${API}/api/messages`, { headers });
              if (mRes.ok) {
                const full = await mRes.json();
                setMessages(full);
                const unread = full.filter(m => !m.read);
                if (unread.length === 0) { setUnreadCount(0); return; }
                // Prefer batch endpoint if available
                const postHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
                const batchRes = await fetch(`${API}/api/messages/mark-read`, { method: 'POST', headers: postHeaders, body: JSON.stringify({ ids: unread.map(u => u._id) }) });
                if (batchRes.ok) {
                  // update UI locally to avoid extra refetch
                  setMessages(prev => prev.map(pm => ({ ...pm, read: true })));
                  setUnreadCount(0);
                } else {
                  // fallback: mark individually
                  await Promise.all(unread.map(u => fetch(`${API}/api/messages/${u._id}`, { method: 'PUT', headers: postHeaders })));
                  setMessages(prev => prev.map(pm => ({ ...pm, read: true })));
                  setUnreadCount(0);
                }
              }
            } catch (e) {
              console.error('Error marking messages read', e);
            }
          }}>
          Messages {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
        <button onClick={() => setTab('testimonials')}>Testimonials</button>
        <button onClick={() => window.location.href = '/admin/chat'}>Open Chat (Admin)</button>
      </div>
      {tab === 'upload' && (
        <form onSubmit={handleUpload}>
            <input name="title" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                <option value="__add_new">+ Add new category</option>
              </select>
              {form.category === '__add_new' && (
                <div style={{display:'flex', gap:8}}>
                  <input placeholder="New category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                  <button type="button" onClick={async () => {
                    if (!newCategory) return alert('Enter a category name');
                    const res = await fetch(`${API}/api/categories`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCategory }) });
                    if (!res.ok) return alert('Failed to add category: ' + await res.text());
                    const created = await res.json();
                    setCategories(prev => [...prev, created]);
                    setForm({ ...form, category: created.name });
                    setNewCategory('');
                  }}>Add</button>
                </div>
              )}
            </div>
            <textarea name="description" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            <input type="file" multiple onChange={e => setForm({ ...form, images: Array.from(e.target.files) })} />
            <button type="submit">Upload</button>
          </form>
      )}

      {tab === 'manage' && (
        <div className="grid">
          {projects.map(p => (
            <div key={p._id} className="project-card">
              <img src={p.images && p.images[0] ? p.images[0] : '/uploads/placeholder.jpg'} alt={p.title} />
              <h3>{p.title}</h3>
              <div style={{display:'flex', gap:8}}>
                <button onClick={() => alert('Edit flow not implemented yet')}>Edit</button>
                <button onClick={() => deleteProject(p._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'testimonials' && (
        <div>
          <h3>Upload Testimonial</h3>
          <form onSubmit={async e => {
            e.preventDefault();
            const data = new FormData();
            data.append('author', testForm.author);
            data.append('role', testForm.role);
            data.append('quote', testForm.quote);
            if (testForm.avatar) data.append('avatar', testForm.avatar);
            const res = await fetch(`${API}/api/testimonials`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
            if (!res.ok) return alert('Upload failed: ' + await res.text());
            setTestForm({ author: '', role: '', quote: '', avatar: null });
            await refreshAll();
          }}>
            <input placeholder="Author" value={testForm.author} onChange={e => setTestForm({ ...testForm, author: e.target.value })} required />
            <input placeholder="Role (optional)" value={testForm.role} onChange={e => setTestForm({ ...testForm, role: e.target.value })} />
            <textarea placeholder="Quote" value={testForm.quote} onChange={e => setTestForm({ ...testForm, quote: e.target.value })} required />
            <input type="file" accept="image/*" onChange={e => setTestForm({ ...testForm, avatar: e.target.files[0] })} />
            <button type="submit">Upload Testimonial</button>
          </form>

          <h3>Existing Testimonials</h3>
          <div className="grid">
            {testimonials.map(t => (
              <div key={t._id} className="testimonial-admin-card">
                {editingId === t._id ? (
                  <form onSubmit={async e => {
                    e.preventDefault();
                    const data = new FormData();
                    data.append('author', editForm.author);
                    data.append('role', editForm.role);
                    data.append('quote', editForm.quote);
                    if (editForm.avatar) data.append('avatar', editForm.avatar);
                    const res = await fetch(`${API}/api/testimonials/${t._id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: data });
                    if (!res.ok) return alert('Save failed: ' + await res.text());
                    setEditingId(null);
                    await refreshAll();
                  }}>
                    <input value={editForm.author} onChange={e => setEditForm({ ...editForm, author: e.target.value })} required />
                    <input value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} />
                    <textarea value={editForm.quote} onChange={e => setEditForm({ ...editForm, quote: e.target.value })} required />
                    <input type="file" accept="image/*" onChange={e => setEditForm({ ...editForm, avatar: e.target.files[0] })} />
                    <div style={{display:'flex',gap:8}}>
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    {t.avatar && <img src={t.avatar} alt={t.author} style={{width:120,height:120,objectFit:'cover',borderRadius:8}} />}
                    <h4>{t.author}</h4>
                    <div className="muted small">{t.role}</div>
                    <p>{t.quote}</p>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={() => { setEditingId(t._id); setEditForm({ author: t.author || '', role: t.role || '', quote: t.quote || '', avatar: null }); }}>Edit</button>
                      <button onClick={async () => {
                        if (!confirm('Delete testimonial?')) return;
                        const res = await fetch(`${API}/api/testimonials/${t._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                        if (res.ok) await refreshAll(); else alert('Delete failed');
                      }}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div className="messages-list messages-grid">
          {messages.map(m => (
            <div key={m._id} className={m.read ? 'read' : 'unread message-card'}>
              <div className="message-head">
                <div>
                  <b>{m.name}</b>
                  <div className="muted small">{m.email} {m.whatsappnumber ? (<span>• <a href={`tel:${m.whatsappnumber}`}>{m.whatsappnumber}</a></span>) : null}</div>
                </div>
                <div className="message-actions">
                  <button onClick={() => { navigator.clipboard && m.whatsappnumber && navigator.clipboard.writeText(m.whatsappnumber); }}>Copy</button>
                  {m.whatsappnumber && <a className="btn" href={`https://wa.me/${m.whatsappnumber.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer">WhatsApp</a>}
                </div>
              </div>
              <div className="message-body">{m.content}</div>
              <div className="message-foot">
                <span className="muted small">{new Date(m.createdAt).toLocaleString()}</span>
                <div>{!m.read && <button onClick={() => markAsRead(m._id)}>Mark as Read</button>}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
