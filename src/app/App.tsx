import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Samples } from '../pages';
import '../styles/App.css';
import { HomeIcon, ProjectIcon } from '../styles/icons';
import logo from '../assets/logo.png';

function App() {
  const location = useLocation();

  return (
    <>
      <header>
        <Link to="/" className="logo-link">
          <img src={logo} alt="Visual Lab" className="logo" />
        </Link>
        <nav>
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
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Samples />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
