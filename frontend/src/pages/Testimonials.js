import React, { useEffect, useState } from 'react';
import Rating from 'react-rating';
import TestimonialCard from '../components/TestimonialCard';
import '../styles/Testimonials.css';

function StarRating({ value }) {
  const stars = [1,2,3,4,5];
  return (
    <div className="star-rating" aria-hidden>
      {stars.map(s => (
        <span key={s} className={s <= Math.round(value || 0) ? 'star filled' : 'star'}>★</span>
      ))}
    </div>
  );
}

function InteractiveStars({ currentAvg, count, onRate, disabled }) {
  // use react-rating for better UX, but fall back to simple stars if not available
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <Rating
        initialRating={currentAvg || 0}
        emptySymbol={<span className="star">☆</span>}
        fullSymbol={<span className="star filled">★</span>}
        fractions={1}
        onClick={(val) => { if (!disabled) onRate(Math.round(val)); }}
        readonly={disabled}
      />
      <span className="muted small">{count || 0}</span>
    </div>
  );
}

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/testimonials`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setTestimonials(data);
      } catch (err) { console.error('Could not load testimonials', err); }
      setLoading(false);
    })();
  }, []);

  const handleRate = async (id, stars) => {
    // simple client-side dedupe: remember in localStorage
    const key = `rated_testimonial_${id}`;
    if (localStorage.getItem(key)) return alert('You already rated this testimonial.');

    // optimistic update
    setTestimonials(prev => prev.map(t => t._id === id ? ({ ...t, ratingsCount: (t.ratingsCount||0)+1, avgRating: ((t.avgRating||0)*(t.ratingsCount||0) + stars)/((t.ratingsCount||0)+1) }) : t));

    try {
      const res = await fetch(`${API}/api/testimonials/${id}/rate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: stars }) });
      if (!res.ok) throw new Error(await res.text());
      localStorage.setItem(key, '1');
    } catch (err) {
      console.error('Rating failed', err);
      alert('Rating failed: ' + err.message);
      // rollback fetch fresh list
      try { const r = await fetch(`${API}/api/testimonials`); if (r.ok) setTestimonials(await r.json()); } catch(e){/* ignore */}
    }
  };

  if (loading) return <div className="testimonials container"><h2>Client Testimonials</h2><p>Loading…</p></div>;

  return (
    <div className="testimonials container">
      <h2>Client Testimonials</h2>
      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div key={t._id}>
            <TestimonialCard {...t} avatar={t.avatar} />
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
              <InteractiveStars currentAvg={t.avgRating} count={t.ratingsCount} onRate={(s)=>handleRate(t._id,s)} disabled={!!localStorage.getItem(`rated_testimonial_${t._id}`)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Testimonials;
