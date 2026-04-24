import React, { useState, useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import Carousel from '../components/Carousel';
import '../styles/Portfolio.css';

function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);



  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data));

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(['All', ...data.map(c => c.name)]))
      .catch(() => {});
  }, []);
  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  const [active, setActive] = useState(null);
  const handleProjectClick = (project) => setActive(project);
  const close = () => setActive(null);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    // reset description expansion when modal opens/closes or active changes
    setDescExpanded(false);
  }, [active]);

  return (
    <div className="portfolio">
      <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeInUp 0.6s ease-out' }}>
        <h2 style={{ fontSize: '3rem', margin: '0 0 1rem' }}>My Work</h2>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>A selection of my recent design projects, spanning brand identity, print media, and digital experiences.</p>
      </div>

      <div className="filters" style={{ animation: 'fadeIn 0.8s ease-out' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={filter === cat ? 'active' : ''}>{cat}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
          <p>No projects found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-columns" style={{ animation: 'fadeInUp 1s ease-out' }}>
          {filtered.map(project => (
            <ProjectCard key={project._id} project={project} onClick={handleProjectClick} />
          ))}
        </div>
      )}
      
     
      <Modal open={!!active} onClose={close}>
        {active && (
          <div className="project-detail">
            <h2>{active.title}</h2>
            <p className="meta">{active.category} — {new Date(active.createdAt).toLocaleDateString()}</p>
            <Carousel images={active.images || []} />
            <div className={`description ${descExpanded ? 'expanded' : 'collapsed'}`}>{active.description}</div>
            <button className="show-more" onClick={() => setDescExpanded(s => !s)}>{descExpanded ? 'Show less' : 'Show more'}</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Portfolio;
