import React from 'react'
import Github from '../../Assets/GitHub.png'
import Insta from '../../Assets/Instagram.png'
import Linkedin from '../../Assets/LinkedIn.png'
function icons() {
    return (
        <div className='icon-set'>
            <img src={Linkedin} alt='LI' />
            <img src={Github} alt='GI' />
            <img src={Insta} alt='In' />
        </div>
    )
}

export default icons