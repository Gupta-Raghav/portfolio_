// React Component Correction
import React from 'react'
import './Hero.css'
import Icons from './icons'

function Hero() {
  return (
    <div className='hero'>
      <div className='hero-content'>
            <div className='hero-heading'> {/* Corrected class name */}
              <h4>Raghav Gupta</h4>  
            </div>
            <div className='hero-main'>
              <h1>Developing</h1>
              <h1>Good Shit</h1> {/* Correct capitalization if needed */}
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
            </div>
    </div>
  )
}

export default Hero
