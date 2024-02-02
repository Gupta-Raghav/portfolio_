// React Component Correction
import React from 'react'
import './Hero.css'
import Icons from './icons'
import { Link } from 'react-scroll';

function Hero() {
  return (
    <div className='hero'>
      <div className='hero-content'>
            <div className='hero-heading'> {/* Corrected class name */}
              <h4>Raghav Gupta</h4>  
            </div>
            <div className='hero-main'>
              <h1>Developing</h1>
              <h1>Good Stuff</h1> {/* Correct capitalization if needed */}
              <h1>Since</h1>
              <h1>2020</h1>
            </div> 
      </div>      
            <Icons/>
            <div className='hero-footer'>
            <p>
                  Software Developer
                </p>
                <p>
                  Seeking full time SWE roles
                </p>
                <Link to='About'smooth={true} duration={850}><div className='scroll-button'><h4>Scroll Down</h4> <h5>To discover</h5></div></Link>
            </div>
    </div>
  )
}

export default Hero
