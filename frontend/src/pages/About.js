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
      <div className="about-image">
        <img src={imgSrc} alt="Isaiah Methuselah" className="profile-photo" loading="lazy" />
      </div>
      <div className="about-content">
        <h2>About Me</h2>

        <h3>Work experience</h3>
        <p>
          Been a graphic designer for 3 years, creating functional and effective designs that meet clients' goals and expectations.
        </p>
        <p>
          I&apos;ve worked with different brands from the fashion industry, the health industry, tech industry and real estates companies.
        </p>

        <h3>Skills & Tools</h3>
        <div className="skills-list" aria-label="skills and tools">
          {[
            'Adobe Photoshop',
            'Illustrator',
            'InDesign',
            'Canva',
            'Branding',
            'Print Design',
            'Typography',
            'Logo Design'
          ].map((s) => (
            <span key={s} className="skill-badge">{s}</span>
          ))}
        </div>

        <h3>Fun Fact</h3>
        <p>
          Outside of design, I enjoy sketching, photography, and exploring creative trends online.
        </p>

        <a href="/the-creative-isaiah-resume-cv.pdf" download className="cta-btn">Download CV</a>
      </div>
    </div>
  );
}

export default About;
