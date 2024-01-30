import React, { useEffect } from "react";
import { preLoaderAnim } from "../../animations/index";
import './preloader.scss'

const PreLoader = () => {
  useEffect(() => {
    preLoaderAnim();
  }, []);
  return (
    <div className="preloader">
      <div className="texts-container">
        <span>Developer,</span>
        <span>Leader,</span>
        <span>Author.</span>
      </div>
    </div>
  );
};

export default PreLoader;