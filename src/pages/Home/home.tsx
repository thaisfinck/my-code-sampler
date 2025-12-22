import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <>
      <section>
        <h1>VISUAL LAB</h1>

        <p>
          Visual Lab is my personal website and learning playground. I use it to
          experiment with frontend tools, creative coding, and Three.js while
          sharing the process publicly.
        </p>

        <Link to="/projects">Explore the Visual Lab →</Link>
      </section>

      <section>
        <i>
          This project is a work in progress and intentionally unfinished.
          Experiments are exploratory and evolve over time.
        </i>
      </section>
    </>
  );
};

export default Home;
