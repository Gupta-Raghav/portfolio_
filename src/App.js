import './App.css';
import About from './components/About/About';
import About_bent from './components/About/About_bent';
import Hero from './components/hero/Hero';
import Navbar from './components/navBar/navBar';
import Projects from './components/projects/projects';
function App() {
  return (
    <div className='App'>
      <Navbar />
      <Hero />
      {/* <About /> */}
      <About_bent />
      <Projects />
    </div>
  );
}

export default App;
