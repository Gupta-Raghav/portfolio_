import './App.css';
import About from './components/About/About';
import Hero from './components/hero/Hero';
import Navbar from './components/navBar/navBar';
import Projects from './components/projects/projects';
function App() {
  return (
    <div className='App'>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <About />

    </div>
  );
}

export default App;
