import { useState } from 'react';
import Home from '../pages/Home';
import Projects from '../pages/Projects';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  return (
    <>
      <header>
        <button onClick={() => setActiveTab('home')}>Home</button>
        <button onClick={() => setActiveTab('projects')}>Projects</button>
      </header>
      <main>
        {activeTab === 'home' && <Home />}
        {activeTab === 'projects' && <Projects />}
      </main>
    </>
  );
}

export default App;
