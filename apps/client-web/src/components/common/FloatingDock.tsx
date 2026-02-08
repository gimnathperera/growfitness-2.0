import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

import { useRef, useState, useEffect } from 'react';

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  onItemClick,
  activeTab,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; id?: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
  onItemClick?: (item: { title: string; href?: string; id?: string }) => void;
  activeTab?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
        onItemClick={onItemClick}
        activeTab={activeTab}
      />
      <FloatingDockMobile
        items={items}
        className={mobileClassName}
        onItemClick={onItemClick}
        activeTab={activeTab}
      />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
  onItemClick,
  activeTab,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; id?: string }[];
  className?: string;
  onItemClick?: (item: { title: string; href?: string; id?: string }) => void;
  activeTab?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show navigation when scrolled halfway down the page
      const scrollThreshold = (documentHeight - windowHeight) * 0.5;
      setIsVisible(scrollPosition > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleItemClick = (item: {
    title: string;
    href?: string;
    id?: string;
  }) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <motion.div
      className={cn('relative block md:hidden', className)}
      initial={{ opacity: 0, y: 100 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 100,
      }}
      transition={{
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
      }}
    >
      <div className="flex flex-row gap-3 justify-center">
        {items.map((item, idx) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.title}
              onClick={() => handleItemClick(item)}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 shadow-lg border-3 focus:outline-none focus:ring-2 focus:ring-primary/50',
                isActive
                  ? 'bg-grow-100 border-primary shadow-2xl'
                  : 'bg-grow-50 hover:bg-grow-100 border-primary',
              )}
              style={{
                borderRadius: '50%',
                backgroundColor: isActive
                  ? 'var(--grow-100)'
                  : 'var(--grow-50)',
                borderColor: 'var(--primary)',
                borderWidth: '3px',
                boxShadow:
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              animate={{
                y: isActive ? -8 : 0,
                scale: isActive ? 1.15 : 1,
                opacity: 1,
              }}
              whileHover={{
                scale: isActive ? 1.2 : 1.1,
                y: isActive ? -10 : -5,
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{
                delay: idx * 0.1,
                duration: 0.3,
                type: 'spring',
                stiffness: 200,
              }}
            >
              <div className="h-5 w-5 text-primary">{item.icon}</div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  onItemClick,
  activeTab,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; id?: string }[];
  className?: string;
  onItemClick?: (item: { title: string; href?: string; id?: string }) => void;
  activeTab?: string;
}) => {
  const mouseX = useMotionValue(Infinity);

  const handleItemClick = (item: {
    title: string;
    href?: string;
    id?: string;
  }) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <motion.div
      onMouseMove={e => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-white px-4 pb-3 md:flex shadow-lg border border-gray-200',
        className,
      )}
    >
      {items.map(item => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          {...item}
          onItemClick={handleItemClick}
          activeTab={activeTab}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  id,
  onItemClick,
  activeTab,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href?: string;
  id?: string;
  onItemClick?: (item: { title: string; href?: string; id?: string }) => void;
  activeTab?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isActive = activeTab === id;

  const distance = useTransform(mouseX, val => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(distance, [-150, 0, 150], [48, 64, 48]);

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 24, 20],
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 24, 20],
  );

  const size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (onItemClick) {
      onItemClick({ title, href, id });
    }
  };

  return (
    <button onClick={handleClick} className="border-none bg-transparent p-0">
      <motion.div
        ref={ref}
        style={{
          width: size,
          height: size,
          backgroundColor: isActive ? 'var(--grow-100)' : 'var(--grow-50)',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'relative flex aspect-square items-center justify-center rounded-full transition-colors cursor-pointer shadow-lg border-3',
          isActive
            ? 'ring-2 ring-primary ring-offset-2 border-primary'
            : 'hover:bg-grow-100 border-primary',
        )}
        animate={{
          y: isActive ? -4 : 0,
          scale: isActive ? 1.1 : 1,
        }}
        whileHover={{
          scale: isActive ? 1.15 : 1.05,
          y: isActive ? -6 : -2,
          boxShadow:
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 2, x: '-50%' }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs whitespace-pre text-gray-700 shadow-md"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          <div className="text-primary">{icon}</div>
        </motion.div>
      </motion.div>
    </button>
  );
}
