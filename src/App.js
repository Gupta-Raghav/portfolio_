import './App.css';
import About from './components/About/About';
import Hero from './components/hero/Hero';
import Navbar from './components/navBar/navBar';
import Projects from './components/projects/projects';
import Contact from './components/Contact/contact';
import Footer from './components/Footer/footer';
import PreLoader from './components/preloader/preLoader';

function App() {
  
  return (
    <>
    <PreLoader/>
    <div className='App'>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Contact/>
      <Footer/>
    </div>
    </>
  );
}

export default App;
