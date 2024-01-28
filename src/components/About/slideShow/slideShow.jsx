import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './slideShow.css';


const colors = ["#0088FE", "#00C49F", "#FFBB28"];
const delay = 2500;

function Slideshow() {
  const [index, setIndex] = useState(0);
  const slideshowSliderRef = useRef(null);

  useEffect(() => {
    const automaticScroll = () => {
      gsap.to(slideshowSliderRef.current, {
        duration: 0.5,
        x: -index * 100 + '%',
        onComplete: () => {
          setIndex((prevIndex) =>
            prevIndex === colors.length - 1 ? 0 : prevIndex + 1
          );
        },
      });
    };

    const intervalId = setInterval(automaticScroll, delay);

    return () => {
      clearInterval(intervalId);
    };
  }, [index]);

  return (
    <div className="slideshow">
      <div
        className="slideshowSlider"
        style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
        ref={slideshowSliderRef}
      >
        {colors.map((backgroundColor, idx) => (
          <div
            className="slide"
            key={idx}
            style={{ backgroundColor }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default Slideshow;
