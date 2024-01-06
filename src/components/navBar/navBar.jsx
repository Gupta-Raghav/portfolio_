import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './navBar.css';

function NavBar() {
  const [isHovered, setIsHovered] = useState(false);

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };

  return (
    <div className='nav'>
      <div className='nav-left' onMouseEnter={handleHover} onMouseLeave={handleMouseOut}>
        <div className='logo'>
          <div className='initials'>R</div>
            <div className='name-part'>
              <div div className='hidden-text'>aghav</div>
            </div>
          <div className='initials'>G</div>
          <div className='name-part'>
            <div className='hidden-text'>upta</div>
            </div>
        </div>
      </div>
      <div className='nav-right'>
        <p>About</p>
        <p>Work</p>
        <p>Contact</p>
      </div>
    </div>
  );
}

export default NavBar;
