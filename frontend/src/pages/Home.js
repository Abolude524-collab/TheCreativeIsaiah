import React from 'react';
import Carousel from '../components/Carousel';
import TestimonialCard from '../components/TestimonialCard';
import '../styles/Home.css';

function Home() {
  // Featured projects served from frontend public/ (place images in frontend/public)
  const featured = [
    '/uploads/Defi.jpg',
    '/uploads/TDC.jpg',
    '/uploads/BSimput.png',
    '/uploads/Nescafe.png'
    
     
  ];
  return (
    <div className="home">
      <section className="hero container">
        <div className="hero-left" style={{ animation: 'fadeInUp 0.8s ease-out forwards' }}>
          <h1>Hi, I'm Isaiah.<br />Creative <span style={{ color: 'var(--accent)' }}>Designer</span></h1>
          <p className="tagline">Brand Identity Designer &bull; Design Coach &bull; Creative Powerhouse</p>
          <p className="lead">I craft compelling visual narratives through brand identity, posters, print, and digital design, all with deliberate intention and strategic thinking.</p>
          <div className="hero-actions">
            <a href="/portfolio" className="cta-btn">View My Work</a>
            <a href="/contact" className="cta-btn secondary">Let's Talk</a>
          </div>
        </div>

        <div className="hero-right" style={{ animation: 'fadeIn 1.2s ease-out forwards' }}>
          <div className="profile-wrap">
            <img src="/uploads/Isaiah.jpg" alt="Isaiah Methuselah" className="profile-photo" />
            <img src="/uploads/Logo1.png" alt="Logo 1" className="floating logo-a" />
            <img src="/uploads/Logo2.jpg" alt="Logo 2" className="floating logo-b" />
          </div>
        </div>
      </section>

      <section className="about-short container">
        <h2>Behind the Designs</h2>
        <p>I'm a creative designer specializing in branding, logos, and print media. Beyond creating striking visuals, I'm also passionate about sharing knowledge as a design coach, helping others unlock their creative potential.</p>
        <div className="center mt-16">
          <a href="/about" className="cta-btn secondary">Read more about my journey</a>
        </div>
      </section>

      <section className="featured-carousel container">
        <h2>Featured Projects</h2>
        <Carousel images={featured} />
      </section>

      <section className="testimonials-preview container">
        <h2>What Clients Say</h2>
        <div className="testimonials-row">
          <TestimonialCard author="Amina K." role="Founder, SparkCo" quote="Isaiah delivered a striking brand identity that helped our launch stand out." />
          <TestimonialCard author="David R." role="Marketing Lead, BrightAds" quote="Fast, professional, and creative — the posters exceeded our expectations." />
          <TestimonialCard author="Lena P." role="Owner, Casa Boutique" quote="Our new logo and flyers brought consistent brand recognition and more foot traffic." />
        </div>
        <div className="center mt-16">
          <a href="/testimonials" className="cta-btn secondary">Read more testimonials</a>
        </div>
      </section>

      <section className="contact-cta container">
        <a href="/contact" className="cta-btn">Contact Me</a>
      </section>
    </div>
  );
}

export default Home;
