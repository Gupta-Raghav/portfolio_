import React, { useRef, useState } from 'react'
import './About2.css'
import LR from '../../Assets/Adobe Lightroom.png'
import cpp from '../../Assets/C++.png'
import fig from '../../Assets/Figma.png'
import react from '../../Assets/React.png'
import js from '../../Assets/JavaScript.png'
import node from '../../Assets/Nodejs.png'
import py from '../../Assets/Python.png'
import sql from '../../Assets/sql.png'
import floating1 from '../../Assets/about/gator.jpg';
import bg from '../../Assets/about/collage.png';
import { useScroll, motion } from 'framer-motion'
import Character from './Character'
import Word from './Word'

function About() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
  target: container,
  offset: ["start 1.2", "start 0.01"]

})
const paragraph = "I am a diversely skilled Software Developer with strong focus on developing user friendly and efficient products."
const words = paragraph.split(" ")
words.map((word, i)=>{
  const start = i/words.length
  const end = start + (1/words.length)
  return <Word key ={i} progress={scrollYProgress} range={[start,end]}>{word}</Word>
})
    return (
      <div className="About" id="About">
        <div className='title_container'>
          <div className="title">
            <h3>About</h3>
          </div>
        </div>
        <div className="aboutWrapper">
            <div className="contentAndSkills">
              {/* <motion.div ref={container} className="About_content" style={{opacity: scrollYProgress}}> */}
              <Character paragraph={paragraph}/>
              {/* </motion.div> */}
              <div className='skills'>
                <h2>Skills</h2>
                <div className='skill-icons'>
                  <img src={react} alt='' />
                  <img src={js} alt='' />
                  <img src={cpp} alt='' />
                  <img src={py} alt='' />
                  <img src={fig} alt='' />
                  <img src={LR} alt='' />
                  <img src={node} alt='' />
                  <img src={sql} alt='' />
                </div>
              </div>
            </div>
          <div className="pic">
            <img src={floating1} alt='image' width={250}/>
          </div>
        </div>
      </div>
    )
  }
  
  export default About;