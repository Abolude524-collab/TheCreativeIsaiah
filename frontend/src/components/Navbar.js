import React, { useState } from 'react';
import '../styles/Navbar.css';

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
          <img src="/uploads/Logo2.jpg" alt="Logo" style={{ height: '60px', verticalAlign: 'middle', borderRadius: '8px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px' }}>
            <span style={{ fontWeight: 'bold', letterSpacing: '-0.02em', fontSize: '1.2rem', lineHeight: '1.2' }}>The Creative Isaiah</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic', fontWeight: 'normal' }}>...where creativity thrives</span>
          </div>
        </a>
      </div>
      <button className="menu-toggle" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
        {open ? '✕' : '☰'}
      </button>
      <ul className={open ? 'mobile-hidden' : ''} onClick={() => setOpen(false)}>
        <li><a href="/">Home</a></li>
        <li><a href="/portfolio">Portfolio</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/admin">Admin</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
