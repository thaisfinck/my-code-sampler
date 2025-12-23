import ProjectCard from './projectCard';
import './projects.css';

const Projects = () => {
  return (
    <section>
      <h1>PROJECTS</h1>
      <ProjectCard
        title="Mocked Title 1"
        description="Mocked description"
        project={<div>Exemple of project</div>}
      />
      <ProjectCard
        title="Mocked Title 2"
        project={<div>Another exemple of a project</div>}
      />
    </section>
  );
};

export default Projects;
