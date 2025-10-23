import React, { useState, useEffect, useRef } from 'react';
import '../styles/Carousel.css';

function Carousel({ images = [], auto = true, interval = 8000 }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const interactionRef = useRef(false);
  const touchStartRef = useRef(null);
  const touchMoveRef = useRef(null);

  useEffect(() => {
    if (!auto || images.length <= 1) return;
    if (isPaused) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images, auto, interval, isPaused]);

  if (!images || images.length === 0) return <div className="carousel empty">No images</div>;

  const handleUserInteractStart = () => {
    interactionRef.current = true;
    setIsPaused(true);
  };

  const handleUserInteractEnd = () => {
    interactionRef.current = false;
    // keep paused until user stops interacting for a short delay
    setTimeout(() => {
      if (!interactionRef.current) setIsPaused(false);
    }, 1200);
  };

  const handleTouchStart = (e) => {
    interactionRef.current = true;
    setIsPaused(true);
    touchStartRef.current = e.touches && e.touches[0] ? e.touches[0].clientX : null;
    touchMoveRef.current = null;
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    touchMoveRef.current = e.touches && e.touches[0] ? e.touches[0].clientX : null;
  };

  const handleTouchEnd = () => {
    const start = touchStartRef.current;
    const end = touchMoveRef.current;
    if (start != null && end != null) {
      const dx = end - start;
      const threshold = 40; // px
      if (Math.abs(dx) > threshold) {
        if (dx < 0) {
          setIndex(i => (i + 1) % images.length);
        } else {
          setIndex(i => (i - 1 + images.length) % images.length);
        }
      }
    }
    touchStartRef.current = null;
    touchMoveRef.current = null;
    // resume auto-play shortly after touch
    setTimeout(() => { interactionRef.current = false; setIsPaused(false); }, 800);
  };

  return (
    <div
      className="carousel"
      onMouseEnter={handleUserInteractStart}
      onMouseLeave={handleUserInteractEnd}
      onFocus={handleUserInteractStart}
      onBlur={handleUserInteractEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="carousel-inner" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <div key={i} className={`slide`} aria-hidden={i !== index}>
            <img src={src} alt={`slide-${i}`} draggable={false} />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === index ? 'active' : ''}`}
              onClick={() => { setIndex(i); handleUserInteractStart(); }}
              onMouseUp={handleUserInteractEnd}
              aria-label={`Go to slide ${i+1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
