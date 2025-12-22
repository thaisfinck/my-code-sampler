import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import Projects from '../pages/Projects';
import '../styles/App.css';
import { HomeIcon, ProjectIcon } from '../styles/icons';

function App() {
  const location = useLocation();

  return (
    <>
      <header>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          <HomeIcon />
          HOME
        </Link>
        <Link
          to="/projects"
          className={location.pathname === '/projects' ? 'active' : ''}
        >
          <ProjectIcon />
          PROJECTS
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
