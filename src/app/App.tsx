import { useState } from 'react';
import Home from '../pages/Home';
import Projects from '../pages/Projects';
import '../styles/App.css';
import { HomeIcon, ProjectIcon } from '../styles/icons';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  return (
    <>
      <header>
        <button onClick={() => setActiveTab('home')}>
          <HomeIcon />
          HOME
        </button>
        <button onClick={() => setActiveTab('projects')}>
          <ProjectIcon />
          PROJECTS
        </button>
      </header>
      <main>
        {activeTab === 'home' && <Home />}
        {activeTab === 'projects' && <Projects />}
      </main>
    </>
  );
}

export default App;
