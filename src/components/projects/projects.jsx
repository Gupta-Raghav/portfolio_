import React, { useEffect, useRef } from 'react'
import './projects.css'
// import gsap from 'gsap'
// import { ScrollTrigger } from 'gsap/all'
// import { useGSAP } from '@gsap/react'
import {projects}from './data'
import Card from './card'
import { useScroll } from 'framer-motion';
import Lenis from '@studio-freight/lenis'

function Projects() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  })

  useEffect( () => {
    const lenis = new Lenis()

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  })
  return (
    <div ref={ container} className='projects'>
        <div className="title">
            <h2>Selected Projects</h2>
        </div>
        {
          projects.map((project,i) => {
            const targetScale = 1 - ( (projects.length - i) * 0.05);
            return <Card key={`p_${i}`} i={i} {...project} progress={scrollYProgress} range={[i * .2, 1]} targetScale={targetScale}/>
          })
        }
         
    </div>
  )
}

export default Projects 

