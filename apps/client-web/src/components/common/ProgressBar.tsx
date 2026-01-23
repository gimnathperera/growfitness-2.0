import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-amber-100/60 shadow-xl relative z-30">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-amber-100/80 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Progress Text */}
          <div className="flex justify-between items-center mt-2">
            <motion.span
              className="text-sm font-medium text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Step {currentStep} of {totalSteps}
            </motion.span>

            <motion.span
              className="text-sm font-medium text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {Math.round(progress)}% complete
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;