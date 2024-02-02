import './card.scss';
import { useTransform, motion, useScroll } from 'framer-motion';
import { useRef } from 'react';
import muj from '../../Assets/MUJ.webp';
import poly from '../../Assets/Poly.webp';
import lprc from '../../Assets/LPRC.webp';
import share from '../../Assets/link.svg' 
// const images = [lprc,poly,muj]

const Card = ({i, title, description, src, link, color,year,brief, progress, range, targetScale}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  });
  console.log(link)
  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  const rotate = useTransform(scrollYProgress,[0.4, 1 ], [0, 55])

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
        <div className='title'>
        <h1>{title}</h1>
        <a href={link} target='_blank'> <motion.img 
          src={share}
          alt=''
          style={{rotate}}
        /></a>
        </div>
        <div className="body">
          <div className="description">
            <p>{description}</p>
           
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
