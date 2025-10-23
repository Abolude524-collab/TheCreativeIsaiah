import React, { useState } from 'react';
import '../styles/Navbar.css';

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
  <img src="/uploads/Logo2.jpg" alt="Logo" style={{ height: '80px', verticalAlign: 'middle' }} />
        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>The Creative Isaiah- <i>...where creativity thrives</i></span>
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
