import React from 'react'
import Github from '../../Assets/GitHub.png'
import Insta from '../../Assets/Instagram.png'
import Linkedin from '../../Assets/LinkedIn.png'
function icons() {
    return (
        <div className='icon-set'>
            <a href='https://www.linkedin.com/in/raghvgupta/' target="_blank"><img src={Linkedin} alt='LI' /></a>
            <a href='https://github.com/Gupta-Raghav' target="_blank"><img src={Github} alt='GI' /></a>
            <a href='https://www.instagram.com/its_rg_/' target="_blank"><img src={Insta} alt='In' /></a>
        </div>
    )
}

export default icons