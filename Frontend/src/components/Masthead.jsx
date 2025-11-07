import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowDown } from 'react-icons/fi';
import './Masthead.css';

const Masthead = ({ isLanding = false, onCTAClick, ctaText = "Explore Menu" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Default behavior: scroll to menu
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      ref={ref}
      className="masthead"
      style={{ y, opacity }}
    >
      <div className="masthead-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="masthead-text"
        >
          <h1 className="masthead-title">
            Welcome to <span className="highlight">Cafe Akasa</span>
          </h1>
          <p className="masthead-subtitle">
            Delicious food delivered fresh to your doorstep
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="masthead-cta"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-button"
              onClick={handleCTAClick}
            >
              {ctaText}
              {!isLanding && <FiArrowDown className="arrow-icon" />}
            </motion.button>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="masthead-image"
        >
          <div className="food-illustration">
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="floating-food food-1"
            >
              🍕
            </motion.div>
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="floating-food food-2"
            >
              🍔
            </motion.div>
            <motion.div
              animate={{
                y: [0, -25, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="floating-food food-3"
            >
              🍜
            </motion.div>
            <motion.div
              animate={{
                y: [0, -18, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8
              }}
              className="floating-food food-4"
            >
              🥗
            </motion.div>
          </div>
        </motion.div>
      </div>
      {!isLanding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="scroll-indicator"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <FiArrowDown />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Masthead;

