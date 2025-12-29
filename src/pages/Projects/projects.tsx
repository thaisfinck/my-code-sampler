import ProjectCard from './projectCard';
import InteractiveParticleBackground from './InteractiveParticleBackground/interactiveParticleBackground';
import Emitter from './InteractiveParticleBackground/Emitter';
import './projects.css';

const Projects = () => {
  return (
    <section>
      <h1>PROJECTS</h1>
      <ProjectCard
        title="Interactive Particle Background"
        description="A small experiment using Canvas 2D and Zustand to render an interactive particle field."
        project={<InteractiveParticleBackground />}
      />
      <ProjectCard
        title="Interactive Particle Background - Emitter"
        description="A small experiment using Canvas 2D and Zustand to render an interactive particle field."
        project={<Emitter />}
      />
    </section>
  );
};

export default Projects;
