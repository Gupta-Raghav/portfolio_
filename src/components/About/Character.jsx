import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef } from "react";

export default function Paragraph({ paragraph }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.3"],
  });

  const words = paragraph.split(" ");
  return (
    <p ref={container} className="paragraph">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}
let isAlwaysVisible = false;
const Word = ({ children, progress, range }) => {
  const amount = range[1] - range[0];
  const step = amount / children.length;
  isAlwaysVisible =
    children === "Software" || children === "Developer" || children === "Kiro";

  const isKiro = children === "Kiro";

  const wordContent = (
    <>
      {children.split("").map((char, i) => {
        const start = range[0] + i * step;
        const end = range[0] + (i + 1) * step;
        return (
          <Char
            key={`c_${i}`}
            progress={progress}
            range={[start, end]}
            isKiro={isKiro}
          >
            {char}
          </Char>
        );
      })}
    </>
  );

  if (isKiro) {
    return (
      <span className={`word ${isAlwaysVisible ? "always-visible" : ""}`}>
        <a
          href="https://kiro.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          {wordContent}
        </a>
      </span>
    );
  }

  return (
    <span className={`word ${isAlwaysVisible ? "always-visible" : ""}`}>
      {wordContent}
    </span>
  );
};

const Char = ({ children, progress, range, isKiro }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span>
      <span className="shadow">{children}</span>
      <motion.span
        style={{
          opacity: opacity,
          color: isKiro ? "purple" : isAlwaysVisible ? "red" : "inherit",
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};
