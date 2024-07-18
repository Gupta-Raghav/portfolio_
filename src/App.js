import './App.css';
import About from './components/About/About2';
import Hero from './components/hero/Hero';
import Navbar from './components/navBar/navBar';
import Projects from './components/projects/projects';
import Contact from './components/Contact/contact';
import Footer from './components/Footer/footer';
import PreLoader from './components/preloader/preLoader';
import Work from './components/work/work';
import Lenis from '@studio-freight/lenis';
import { useEffect } from 'react';
import { Element } from 'react-scroll';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // you can adjust the duration as needed
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easing function
      smooth: true, // enable smooth scroll
      direction: 'vertical', // scroll direction
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // Clean up the animation frame to avoid memory leaks
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <PreLoader />
      <div className='App'>
        <Navbar />
        <Element name="hero">
          <Hero />
        </Element>
        <Element name="about">
          <About />
        </Element>
        <Element name="work">
          <Work />
        </Element>
        <Element name="projects">
          <Projects />
        </Element>
        <Element name="contact">
          <Contact />
        </Element>
        <Footer />
      </div>
    </>
  );
}

export default App;
