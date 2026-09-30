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
            <p className='hero-lede'>
              I build the agent runtime behind Kiro, the agentic IDE. Before that, full-stack
              products, cloud infrastructure and a lot of late-night side projects.
            </p>
            <div className='hero-actions'>
              <a className='hero-btn' href='/kiro/'>
                <svg className='ghost-dot' viewBox='0 0 1200 1200' aria-hidden='true'><rect width='1200' height='1200' rx='260' fill='#9046FF'/><path fill='#fff' d='M398.554 818.914C316.315 1001.03 491.477 1046.74 620.672 940.156C658.687 1059.66 801.052 970.473 852.234 877.795C964.787 673.567 919.318 465.357 907.64 422.374C827.637 129.443 427.623 128.946 358.8 423.865C342.651 475.544 342.402 534.18 333.458 595.051C328.986 625.86 325.507 645.488 313.83 677.785C306.873 696.424 297.68 712.819 282.773 740.645C259.915 783.881 269.604 867.113 387.87 823.883Z'/></svg>
                What I built on Kiro
                <span className='arrow' aria-hidden='true'>→</span>
              </a>
            </div>
      </div>      
            <Icons/>
            <div className='hero-footer'>
            <p>
                  Software Engineer @ Amazon (Kiro)
                </p>
            </div>
    </div>
  )
}

export default Hero
