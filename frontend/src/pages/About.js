import React, { useEffect, useState } from 'react';
import '../styles/About.css';

function About() {
  const [imgSrc, setImgSrc] = useState((process.env.PUBLIC_URL || '') + '/uploads/Isaiah.jpg');
  useEffect(() => {
    const photo = (process.env.PUBLIC_URL || '') + '/uploads/Isaiah.jpg';
    const fallback = (process.env.PUBLIC_URL || '') + '/uploads/Logo2.jpg';
    const testImg = new Image();
    let mounted = true;
    testImg.onload = () => { if (mounted) setImgSrc(photo); };
    testImg.onerror = (e) => { console.warn('About image load failed, using fallback', e); if (mounted) setImgSrc(fallback); };
    testImg.src = photo;
    return () => { mounted = false; };
  }, []);

  return (
    <div className="about container about-grid">
      <div className="about-image" style={{ animation: 'fadeIn 0.8s ease-out' }}>
        <img src={imgSrc} alt="Isaiah Methuselah" className="profile-photo" loading="lazy" />
      </div>
      <div className="about-content" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s backwards' }}>
        <h2>My Journey</h2>
        <p className="lead" style={{ fontSize: '1.2rem', color: 'var(--brand-deep)', fontWeight: '500', marginBottom: '2rem' }}>
          I believe that great design is not just about making things look good—it's about solving problems and telling compelling stories.
        </p>

        <h3>Experience</h3>
        <p>
          With over 3 years of experience as a graphic designer, I focus on creating functional, striking, and effective designs that exceed client expectations and drive real business goals.
        </p>
        <p>
          My portfolio spans across diverse sectors, including fashion, healthcare, technology, and real estate, allowing me to adapt my creative approach to various brand voices and target audiences.
        </p>

        <h3>Toolkit & Expertise</h3>
        <div className="skills-list" aria-label="skills and tools">
          {[
            'Adobe Photoshop',
            'Illustrator',
            'InDesign',
            'Canva',
            'Brand Identity',
            'Print Design',
            'Typography',
            'Creative Direction'
          ].map((s) => (
            <span key={s} className="skill-badge">{s}</span>
          ))}
        </div>

        <h3>Beyond the Screen</h3>
        <p>
          When I'm not designing, you can find me sketching, practicing photography, or mentoring up-and-coming designers.
        </p>

        <a href="/the-creative-isaiah-resume-cv.pdf" download className="cta-btn" style={{ marginTop: '2rem' }}>Download Resume</a>
      </div>
    </div>
  );
}

export default About;
