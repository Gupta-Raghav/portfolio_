import React, { useRef, useState } from 'react';
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

  const plane = useRef(null);
 

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
     
       <div className="container">

      <div ref={plane} className="navBody">
      <a href='#About'> <Text3d primary={"About"} secondary={"About"}/></a>
          <a href='#About'> <Text3d primary={"Work"} secondary={"Work"}/></a>
          <a href='#contact'> <Text3d primary={"Contact"} secondary={"Contact"}/></a>
      </div>

    </div>
    </div>
  );
}
function Text3d({primary, secondary}) {



  return (

      <div className="navTextContainer">

          <p className="primary">{primary}</p>

          <p className="secondary">{secondary}</p>

      </div>

  )

}
export default NavBar;
