import type { ReactNode } from 'react';
import './projects.css';

const ProjectCard = ({
  title,
  description,
  project,
}: {
  title: string;
  description?: string;
  project: ReactNode;
}) => {
  return (
    <div className="project-card">
      <h2>{title}</h2>
      <div className="corners">
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />
        <div className="project-content">{project}</div>
      </div>
      {description && <i>{description}</i>}
    </div>
  );
};

export default ProjectCard;
