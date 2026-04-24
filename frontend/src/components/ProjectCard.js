import React from 'react';
import '../styles/ProjectCard.css';

function ProjectCard({ project, onClick }) {
  return (
    <div className="project-card" onClick={() => onClick(project)}>
      <div style={{ overflow: 'hidden' }}>
        <img src={project.images && project.images[0] ? project.images[0] : '/uploads/placeholder.jpg'} alt={project.title} loading="lazy" />
      </div>
      <h3>{project.title}</h3>
      <p>{project.category}</p>
    </div>
  );
}

export default ProjectCard;
