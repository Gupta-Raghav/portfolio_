import React from 'react'
import './About_bento.css'
import Slideshow from './slideShow/slideShow'
import LR from '../../Assets/Adobe Lightroom.png'
import cpp from '../../Assets/C++.png'
import fig from '../../Assets/Figma.png'
import react from '../../Assets/React.png'
import js from '../../Assets/JavaScript.png'
import node from '../../Assets/Nodejs.png'
import py from '../../Assets/Python.png'
import {instagram} from '../../Assets/Instagram.png'

function About_bent() {
  
  
  return (
    // <div className='About'>
    //         <h2 className='Title'>About me</h2>
    // <div className='About-Container'>
        
    //     <div className='bento_container'>
    //             <div className='bento-left'>
    //                 <div className='first_container'>
    //                     <div className='text_container'>
    //                         <h1 className='bento-text'>
    //                         I am a diversely skilled <span>Software Developer</span> with strong focus on developing user friendly and efficient products.
    //                         </h1 >
    //                     </div>
    //                     {/* <div className='text_container'>
    //                         <h2 className='bento-text'>
    //                         I am a diversely skilled <span>Software</span> 
    //                         </h2 >
    //                     </div> */}
    //                 </div>
    //                 <div className='last-container'>
    //                     <div className='text_container'>
    //                         <h2 className='bento-text'>
    //                            Tech Skills
    //                            <div className='skill-icons'>
    //                                     <img src={react} alt='' />
    //                                     <img src={js} alt='' />
    //                                     <img src={py} alt='' />
    //                                     <img src={cpp} alt='' />
    //                                     <img src={fig} alt='' />
    //                                     <img src={LR} alt='' />
    //                                     <img src={node} alt='' />
    //                             </div>
    //                         </h2 >
    //                     </div>
    //                     {/* <div className='text_container'>
    //                     <h2 className='bento-text'>
    //                     I am a diversely skilled <span>Software Developer</span> 
    //                     </h2 >
    //                 </div> */}
    //                 </div>
    //             </div>
    //             <div className='bento-right'>
    //             <div className='first_half'>
    //                 <div className='first_container'>
    //                         <div className='text_container'>
    //                             <h2 className='bento-text'>
    //                             I am a diversely skilled <span>Software</span> 
    //                             </h2>
    //                         </div>
    //                     </div>
    //                     <div className='last-container'>
    //                         <div className='text_container'>
    //                             <h2 className='bento-text'>
    //                             I am a diversely skilled <span>Software Developer</span> 
    //                             </h2 >
    //                         </div>
    //                     </div>
    //             </div>
    //             <div className='last_half'>
    //                     <div className='first_container'>
    //                             <div className='text_container'>
                                    
    //                                 <p className='bento-text'>
    //                                 I am a diversely skilled <span>Software</span> 
    //                                 </p>
                                    
    //                             </div>
                                
    //                         </div>
    //                     <div className='last-container'>
    //                         <div className='text_container'>
    //                             <div className='bento-text'>
    //                                 <p>its_rg_ </p>
    //                                 <div className='slideShow'>
    //                                 <Slideshow/>
    //                                 </div>
    //                             </div >
    //                         </div>
    //                     </div>
    //             </div>
            
    //             </div>
    //     </div>
    // </div>
    //     </div>
    <div class="wrapper">
        <div class="grid1">
        <h2 className='bento-text'>
        I am a diversely skilled <span>Software Developer</span> with strong focus on developing user friendly and efficient products.
        </h2 >
        </div>
        <div class="grid2">
        <h2 className='bento-text'>
            40+ projects completed
        </h2 >
        </div>
        <div class="grid3">
            
        </div>
        {/* <div class="grid2"></div> */}
 
        
        
        <div class="grid10">
        <h2 className='bento-text'>
            Tech Skills
        </h2 >
        </div>
        <div class="grid11"></div>
    </div>
  )
}

export default About_bent