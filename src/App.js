import './App.css';
import About from './components/About/About2';
import Hero from './components/hero/Hero';
import Navbar from './components/navBar/navBar';
import Projects from './components/projects/projects';
import Contact from './components/Contact/contact';
import Footer from './components/Footer/footer';
import PreLoader from './components/preloader/preLoader';
import Work from './components/work/work'
import Lenis from '@studio-freight/lenis'
import { useEffect } from 'react';

function App() {
  // useEffect( () => {

  //   const lenis = new Lenis()
  //   function raf(time) {
  //     lenis.raf(time)
  //     requestAnimationFrame(raf)
  //   }
  //   requestAnimationFrame(raf)

  // })
  
  return (
    <>
    <PreLoader/>
    <div className='App'>
      <Navbar />
      <Hero />
      <About />
      <Work/>
      <Projects />
      <Contact/>
      <Footer/>
    </div>
    </>
  );
}

export default App;
