import React, { useRef } from 'react'
import './About.css'
import LR from '../../Assets/Adobe Lightroom.png'
import cpp from '../../Assets/C++.png'
import fig from '../../Assets/Figma.png'
import react from '../../Assets/React.png'
import js from '../../Assets/JavaScript.png'
import node from '../../Assets/Nodejs.png'
import py from '../../Assets/Python.png'
import floating1 from '../../Assets/about/gator.jpg';

import floating2 from '../../Assets/about/night.jpg';

import floating3 from '../../Assets/about/snow.jpg';

import floating4 from '../../Assets/about/stars.jpg';

import floating5 from '../../Assets/about/vlog.jpg';

import floating6 from '../../Assets/about/uni.jpg';

import floating7 from '../../Assets/about/spring.jpg';

import floating8 from '../../Assets/about/red.jpg';


function About() {
  const plane1 = useRef(null);

    const plane2 = useRef(null);

    const plane3 = useRef(null);
  return (
    <div className='About' id='About'>
      <div ref={plane1} className="plane">
        <img src={floating2} alt='image' width={300}/>
        <img src={floating3} alt='image' width={300}/>
        <img src={floating1} alt='image' width={300}/>
      </div>
      <div ref={plane1} className="plane">
        <img src={floating4} alt='image' width={300}/>
        <img src={floating5} alt='image' width={300}/>
      </div>
      <div ref={plane1} className="plane">
        <img src={floating8} alt='image' width={300}/>
        <img src={floating7} alt='image' width={300}/>
      </div>
      <div className="content">
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
    </div>
  )
}

export default About