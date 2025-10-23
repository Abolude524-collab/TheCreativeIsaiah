import React from 'react';
import '../styles/TestimonialCard.css';

function TestimonialCard({ author, role, quote, avatar }) {
  return (
    <div className="testimonial-card">
      {avatar && <img src={avatar} alt={`${author} avatar`} className="testimonial-avatar" />}
      <blockquote className="testimonial-quote">“{quote}”</blockquote>
      <div className="testimonial-author">
        <strong>{author}</strong>
        {role && <span className="testimonial-role"> — {role}</span>}
      </div>
    </div>
  );
}

export default TestimonialCard;
