import React from 'react'
import './About.css'
import LR from '../../Assets/Adobe Lightroom.png'
import cpp from '../../Assets/C++.png'
import fig from '../../Assets/Figma.png'
import react from '../../Assets/React.png'
import js from '../../Assets/JavaScript.png'
import node from '../../Assets/Nodejs.png'
import py from '../../Assets/Python.png'


function About() {
  return (
    <div className='About' id='About'>
       <div className='About-content'>
       <h3>
        About me
       </h3>
        <p>
        I am a diversely skilled <span>Software Developer</span> with strong focus on developing user friendly and efficient products
        </p>
       </div>
       <div className='skills'>
        <h3>Skills</h3>
       <div className='skill-icons'>
            <img src={react} alt='' />
            <img src={js} alt='' />
            <img src={py} alt='' />
            <img src={cpp} alt='' />
            <img src={fig} alt='' />
            <img src={LR} alt='' />
            <img src={node} alt='' />
       </div>
       </div>
    </div>
  )
}

export default About