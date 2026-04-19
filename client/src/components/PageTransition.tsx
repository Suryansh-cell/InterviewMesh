import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    filter: 'blur(10px)'
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)'
  },
  out: {
    opacity: 0,
    scale: 1.05,
    y: -20,
    filter: 'blur(5px)'
  },
};

const pageTransition = {
  duration: 0.6,
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
      style={{
        willChange: 'transform, opacity, filter',
      }}
    >
      {children}
    </motion.div>
  );
}
