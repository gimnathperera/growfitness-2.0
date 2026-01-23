import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

interface ConfettiCelebrationProps {
  isVisible: boolean;
  duration?: number;
  onComplete?: () => void;
  title?: string;
  message?: string;
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isVisible,
  duration = 3000,
  onComplete,
  title = 'Success!',
  message = 'Kids details added successfully!',
}) => {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const colors = useMemo(
    () => [
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#EC4899', // pink-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
    ],
    []
  );

  const emojis = ['🎉', '⭐', '🌟', '💪', '🏆', '🎊', '✨', '🎈'];

  useEffect(() => {
    if (isVisible) {
      // Generate confetti pieces
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100, // Random x position (0-100%)
          y: -10, // Start above screen
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4, // Size between 4-12px
          rotation: Math.random() * 360,
          delay: Math.random() * 1000, // Stagger appearance
        });
      }
      setConfettiPieces(pieces);

      // Clean up after duration
      const timer = setTimeout(() => {
        setConfettiPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete, colors]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Confetti pieces */}
            {confettiPieces.map(piece => (
              <motion.div
                key={piece.id}
                className="absolute rounded-full shadow-lg"
                style={{
                  left: `${piece.x}%`,
                  backgroundColor: piece.color,
                  width: piece.size,
                  height: piece.size,
                }}
                initial={{
                  y: -20,
                  opacity: 0,
                  rotate: piece.rotation,
                  scale: 0,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  opacity: [0, 1, 1, 0],
                  rotate: piece.rotation + 360,
                  scale: [0, 1, 1, 0],
                  x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
                }}
                transition={{
                  duration: 3,
                  delay: piece.delay / 1000,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Emoji confetti */}
            {emojis.map((emoji, index) => (
              <motion.div
                key={`emoji-${index}`}
                className="absolute text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                }}
                initial={{
                  y: -20,
                  opacity: 0,
                  rotate: 0,
                  scale: 0,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  opacity: [0, 1, 1, 0],
                  rotate: 360,
                  scale: [0, 1.2, 1, 0],
                  x: [0, Math.random() * 100 - 50],
                }}
                transition={{
                  duration: 2.5,
                  delay: (Math.random() * 1500) / 1000,
                  ease: 'easeOut',
                }}
              >
                {emoji}
              </motion.div>
            ))}

            {/* Success message overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              >
                <motion.div
                  className="text-6xl mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.5,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  🎉
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold text-gray-800 mb-2 font-insanibc"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {title}
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-600"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {message}
                </motion.p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiCelebration;