import './card.scss';
import Water from "../../Assets/water.jpg";
import { useTransform, motion, useScroll } from 'framer-motion';
import { useRef } from 'react';

const Card = ({i, title, description, src, url, color,year,brief, progress, range, targetScale}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
   <div ref={container} className="cardContainer">
    
      <motion.div 
        style={{backgroundColor: color, scale, top: `calc(-5vh + ${i * 25}px)`}} 
        className="card"
      >
        <div className='top'>
          <h4>{year}</h4>
          <h5>{brief}</h5>
        </div>
        <h1>{title}</h1>
        <div className="body">
          <div className="description">
            <p>{description}</p>
            <span>
              <a href={url} target="_blank">See more</a>
              {/* SVG remains the same */}
            </span>
          </div>

          <div className="imageContainer">
            <motion.div
              className="inner"
              style={{scale: imageScale}}
            >
              <img
                src={src}
                alt="image" 
              />
            </motion.div>
          </div>

        </div>
      </motion.div>
    </div>
  );

}
export default Card;
