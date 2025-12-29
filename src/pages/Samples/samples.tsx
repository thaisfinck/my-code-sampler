import SampleCard from './sampleCard';
import { Repulsion, Emitter } from '../../projects';
import './samples.css';

const Samples = () => {
  return (
    <section>
      <h1>Samples</h1>
      <SampleCard
        title="Interactive Particle Background - Repulsion"
        description="A small experiment using Canvas 2D and Zustand to render an interactive particle field."
        project={<Repulsion />}
      />
      <SampleCard
        title="Interactive Particle Background - Emitter"
        description="A small experiment using Canvas 2D and Zustand to render an interactive particle field."
        project={<Emitter />}
      />
    </section>
  );
};

export default Samples;
