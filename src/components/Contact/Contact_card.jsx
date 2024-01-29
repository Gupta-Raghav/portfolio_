import React, { useEffect } from 'react';
import './contact_card.css'

const CardComponent = () => {
  const subtitleText = "But in a much more real sense, let's make the world a better place together.";
  const inspiredText = "Inspired from twitch"
  useEffect(() => {
    const subtitle = document.getElementsByClassName("contactCard-subtitle")[0];
    const words = subtitleText.split(" ");

    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.innerHTML = `${word} `;
      span.classList.add("contactCard-subtitle-word");
      span.style.transitionDelay = `${index * 40}ms`;
      subtitle.appendChild(span);
    });
    const inspire = document.getElementsByClassName("contactCard-inspire")[0];
    const string = inspiredText.split(" ");
    string.forEach((s, index) => {
        const span = document.createElement("span");
        span.innerHTML = `${s} `;
        span.classList.add("contactCard-inpiration-word");
        span.style.transitionDelay = `${index * 40}ms`;
        inspire.appendChild(span);
      });

  }, []);

  return (
    <div>
      <div className="contactCard">
        <div className="contactCard-content">
          <h3 className="contactCard-title">Let's connect</h3>
          <h4 className="contactCard-subtitle"></h4>
            <p className="contactCard-inspire"></p>
        </div>
      </div>
    </div>
  );
};

export default CardComponent;
