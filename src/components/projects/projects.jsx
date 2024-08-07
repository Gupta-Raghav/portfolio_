import React, { useRef } from 'react'
import './projects.css'

import {projects}from './data'
import Card from './card'
import { useScroll } from 'framer-motion';

function Projects() {
  const container = useRef(null);
  const title = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  },{
    target: title,
    offset: ['start end', 'end end']
  })
 


  return (
    <div ref={ container} className='projects' id="projects">
        <div className='title_container'>
        <div ref = {title} className="title">
            <h3>Top Work</h3>
        </div>
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

