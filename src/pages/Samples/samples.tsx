import SampleCard from './sampleCard';
import {
  Repulsion,
  Emitter,
  DataViz,
  StitchesViz,
  TableDataViz,
} from '../../projects';
import './samples.css';

const Samples = () => {
  return (
    <section>
      <h1>Samples</h1>
      <SampleCard
        title="Interactive Particle Background - Repulsion"
        description="A small experiment using Canvas 2D and Zustand to render an interactive particle field. 
        Particles are repulsed by the mouse pointer."
        project={<Repulsion />}
      />
      <SampleCard
        title="Interactive Particle Background - Emitter"
        description="This is also an experiment that uses Canvas 2D and Zustand.
        Particles are emitted from the mouse pointer position."
        project={<Emitter />}
      />

      <SampleCard
        title="State-Driven Stitches Visualization"
        description="A state-first canvas visualization where the number of stitches and the type of stitches are driven by the state. Inspired by classic embroidery patterns."
        project={<StitchesViz />}
      />
      <SampleCard
        title="State-Driven Data Visualization System"
        description="Another state-first canvas visualization where filters, view mode and density settings drive two rendering pipelines: scatter and density."
        project={<DataViz />}
      />

      <SampleCard
        title="State-Driven Table Data Visualization"
        description="A state-first table visualization where filters, view mode and density settings drive the table rendering."
        project={<TableDataViz />}
      />
    </section>
  );
};

export default Samples;
