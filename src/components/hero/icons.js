import React from 'react'
import Github from '../../Assets/GitHub.png'
import Insta from '../../Assets/Instagram.png'
import Linkedin from '../../Assets/LinkedIn.png'
function icons() {
    return (
        <div className='icon-set'>
            <a href='https://www.linkedin.com/in/raghvgupta/' target="_blank" rel="noreferrer"><img src={Linkedin} alt='LI' /></a>
            <a href='https://github.com/Gupta-Raghav' target="_blank" rel="noreferrer"><img src={Github} alt='GI' /></a>
            <a href='https://www.instagram.com/its_rg_/' target="_blank" rel="noreferrer"><img src={Insta} alt='In' /></a>
            <a href='/photography/' className='icon-camera' aria-label='Photography' title='Photography'>
                <svg viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                    <path d='M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.6-2.2A1.5 1.5 0 0 1 10.3 3h3.4a1.5 1.5 0 0 1 1.2.8L16.5 6h2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z' />
                    <circle cx='12' cy='13' r='4' />
                    <circle cx='17.6' cy='9' r='.6' fill='#fff' />
                </svg>
            </a>
        </div>
    )
}

export default icons