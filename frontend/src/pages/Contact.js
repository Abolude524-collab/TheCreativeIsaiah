import React, { useState } from 'react';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', whatsappnumber: '', content: '' });
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', email: '', whatsappnumber: '', content: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        setErr(data.message || 'Failed to send message');
      }
    } catch (error) {
      setErr('Network error');
    }
  };

  return (
    <div className="contact">
      <h2>Contact Me</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="whatsappnumber" type="tel" placeholder="WhatsApp Number" value={form.whatsappnumber} onChange={handleChange} required />
        <textarea name="content" placeholder="Message" value={form.content} onChange={handleChange} required />
        <button type="submit">Send</button>
      </form>
  {success && <div className="alert">Message sent! Check your email</div>}
      {err && <div style={{color:'crimson', marginTop:8}}>{err}</div>}
    </div>
  );
}

export default Contact;
