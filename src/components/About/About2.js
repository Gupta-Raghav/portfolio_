import React, { useRef } from "react";
import "./About2.css";
import react from "../../Assets/React.png";
import js from "../../Assets/JavaScript.png";
import node from "../../Assets/Nodejs.png";
import py from "../../Assets/Python.png";
import github from "../../Assets/GitHub.png";
import fig from "../../Assets/Figma.png";
import floating1 from "../../Assets/about/gator.jpg";
import { useScroll } from "framer-motion";
import Character from "./Character";
import Word from "./Word";

function About() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 1.2", "start 0.01"],
  });
  const paragraph =
    "I am a Software Developer at Amazon (Kiro) with expertise in cross-platform development, AI integration, and scalable system architecture. I've led technical initiatives that improved product reliability by 2% and enabled platform expansion to 1,654+ Windows users, demonstrating measurable business impact through innovative engineering solutions.";

  return (
    <div className="About" id="About">
      <div className="title_container">
        <div className="title">
          <h3>About</h3>
        </div>
      </div>
      <div className="aboutWrapper">
        <div className="contentAndSkills">
          {/* <motion.div ref={container} className="About_content" style={{opacity: scrollYProgress}}> */}
          <Character paragraph={paragraph} />
          {/* </motion.div> */}
          <div className="skills">
            <h2>Skills</h2>
            <div className="skill-icons">
              <img src={react} alt="React" />
              <img src={js} alt="JavaScript" />
              <img src={node} alt="Node.js" />
              <img src={py} alt="Python" />
              <img src={github} alt="GitHub" />
              <img src={fig} alt="Figma" />
            </div>
          </div>
        </div>
        <div className="pic">
          <img src={floating1} alt="Raghav Gupta" width={250} />
        </div>
      </div>
    </div>
  );
}

export default About;
