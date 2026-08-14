import React from 'react';
import { motion } from 'motion/react';

interface PuroIllustrationProps {
  type?: 'leaf' | 'abstract' | 'circle' | 'moon';
  className?: string;
}

export default function PuroIllustration({ type = 'leaf', className = 'w-24 h-24' }: PuroIllustrationProps) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={`${className} mx-auto pointer-events-none`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 0.7, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {type === 'leaf' && (
        <motion.path
          d="M100 175C100 175 155 120 155 65C155 35 128 15 100 15C72 15 45 35 45 65C45 120 100 175 100 175Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      )}

      {type === 'abstract' && (
        <motion.path
          d="M50 100C50 60 80 40 120 60C160 80 160 140 120 160C80 180 50 140 50 100Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          animate={{ 
            d: [
              "M50 100C50 60 80 40 120 60C160 80 160 140 120 160C80 180 50 140 50 100Z",
              "M60 110C60 70 90 50 130 70C170 90 170 150 130 170C90 190 60 150 60 110Z",
              "M50 100C50 60 80 40 120 60C160 80 160 140 120 160C80 180 50 140 50 100Z"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {type === 'circle' && (
        <motion.circle
          cx="100"
          cy="100"
          r="65"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      )}

      {type === 'moon' && (
        <motion.path
          d="M120 40C90 40 65 65 65 95C65 125 90 150 120 150C100 140 85 120 85 95C85 70 100 50 120 40Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />
      )}

      <circle cx="100" cy="100" r="2.5" fill="currentColor" opacity="0.8" />
    </motion.svg>
  );
}
