import React from 'react';
import '../styles/Navbar.css';
import '../styles/Footer.css';

function Footer() {
  // WhatsApp deep link (phone must be in international format without + or spaces)
  const phone = '2348067302340';
  const message = encodeURIComponent('Hi Isaiah, I saw your portfolio and would like to get in touch.');
  const waLink = `https://wa.me/${phone}?text=${message}`;

  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="brand-cta">
          <h4>The Creative Isaiah</h4>
          <p className="lead">Crafting brand identities and visuals that connect with your audience. Want to collaborate?</p>
          <div className="socials">
          <a className="wa" href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
            <svg className="social-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 .13 4.9.02 11.31a12 12 0 0 0 2.06 6.24L0 24l6.77-2.14A11.92 11.92 0 0 0 12 24c6.63 0 11.87-4.9 11.98-11.31a11.93 11.93 0 0 0-3.46-9.21z" fill="#25D366"/>
              <path d="M17.5 14.2c-.3-.15-1.76-.87-2.03-.98-.27-.11-.47-.16-.67.16s-.77.98-.95 1.18c-.18.19-.36.22-.66.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.67-2.06-.18-.31-.02-.48.13-.63.13-.13.3-.34.45-.51.15-.17.2-.31.3-.52.1-.21.05-.39-.02-.54-.07-.15-.67-1.6-.92-2.2-.24-.57-.49-.49-.67-.5-.17-.01-.37-.01-.56-.01-.18 0-.47.07-.72.33-.25.26-.96.94-.96 2.29 0 1.35.98 2.65 1.12 2.83.14.19 1.93 3.1 4.68 4.35 2.75 1.25 2.75.83 3.24.78.48-.05 1.56-.64 1.78-1.26.22-.62.22-1.15.15-1.26-.07-.11-.27-.17-.57-.31z" fill="#fff"/>
            </svg>
            <span className="social-text">WhatsApp</span>
          </a>

          <a href="https://www.facebook.com/profile.php?id=61565956590284&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" aria-label="Visit Facebook">
            <svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.34 2 2 6.48 2 12.07 2 17.1 5.66 21.28 10.44 22v-7.01H8.08v-2.92h2.36V9.41c0-2.33 1.38-3.61 3.5-3.61.99 0 2.03.18 2.03.18v2.22h-1.14c-1.13 0-1.49.71-1.49 1.44v1.72h2.52l-.4 2.92h-2.12V22C18.34 21.28 22 17.1 22 12.07z" fill="#1877F2"/>
            </svg>
            <span className="social-text">Facebook</span>
          </a>

          <a href="https://www.instagram.com/the_creative_isaiah?igsh=MTg3YW5uY2tuYXFlOQ==" target="_blank" rel="noopener noreferrer" aria-label="Visit Instagram">
            <svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zm6.5-3a1 1 0 1 0 1 1 1 1 0 0 0-1-1z" fill="#E1306C"/>
              <circle cx="12" cy="12" r="3.2" fill="#fff"/>
            </svg>
            <span className="social-text">Instagram</span>
          </a>
          </div>
        </div>

        <div>
          <div className="footer-links">
            <a href="/about" className="footer-link">About</a>
            <a href="/contact" className="footer-link">Contact</a>
            <a href="/portfolio" className="footer-link">Portfolio</a>
          </div>
          <p className="copyright">
            &copy; {new Date().getFullYear()} The Creative Isaiah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;



