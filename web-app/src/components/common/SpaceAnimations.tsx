import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';
import { Box, styled } from '@mui/material';

// Floating animation component
export const FloatingCard = styled(motion.div)`
  will-change: transform;
`;

// Pulsing glow effect
export const PulsingGlow = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
    background: theme.space.gradients.nebula,
    borderRadius: 'inherit',
    opacity: 0.3,
    filter: 'blur(15px)',
    animation: 'pulse 2s ease-in-out infinite',
    zIndex: -1,
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.3, transform: 'scale(0.95)' },
    '50%': { opacity: 0.7, transform: 'scale(1.05)' },
  },
}));

// Stagger animation container
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({ 
  children, 
  staggerDelay = 0.1,
  className 
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
export const StaggerItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const variants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    },
  };

  return (
    <motion.div variants={variants}>
      {children}
    </motion.div>
  );
};

// Cosmic shimmer effect
export const CosmicShimmer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(
      90deg,
      transparent,
      rgba(139, 92, 246, 0.4),
      transparent
    )`,
    animation: 'shimmer 3s ease-in-out infinite',
    zIndex: 1,
  },
  '@keyframes shimmer': {
    '0%': { left: '-100%' },
    '100%': { left: '100%' },
  },
}));

// Particle background
export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#8B5CF6', '#06B6D4', '#A855F7', '#F8FAFC', '#EC4899'];

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0.3,
      }}
    />
  );
};

// Scroll reveal animation
interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  className,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const controls = useAnimation();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

// Orbital motion component
interface OrbitProps {
  children: React.ReactNode;
  radius?: number;
  duration?: number;
  direction?: 'clockwise' | 'counterclockwise';
}

export const Orbit: React.FC<OrbitProps> = ({
  children,
  radius = 100,
  duration = 20,
  direction = 'clockwise',
}) => {
  const orbitVariants: Variants = {
    animate: {
      rotate: direction === 'clockwise' ? 360 : -360,
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const counterRotateVariants: Variants = {
    animate: {
      rotate: direction === 'clockwise' ? -360 : 360,
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <motion.div
      style={{
        position: 'relative',
        width: radius * 2,
        height: radius * 2,
      }}
      variants={orbitVariants}
      animate="animate"
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        variants={counterRotateVariants}
        animate="animate"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Cosmic loading spinner
export const CosmicSpinner: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            width: size - index * 8,
            height: size - index * 8,
            border: '2px solid',
            borderColor: `rgba(139, 92, 246, ${0.8 - index * 0.2})`,
            borderRadius: '50%',
            borderTopColor: 'transparent',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1 + index * 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </Box>
  );
};

// Glitch effect for futuristic feel
export const GlitchText = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  '&::before, &::after': {
    content: 'attr(data-text)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  '&::before': {
    animation: 'glitch-1 0.5s infinite',
    color: '#06B6D4',
    zIndex: -1,
  },
  '&::after': {
    animation: 'glitch-2 0.5s infinite',
    color: '#EC4899',
    zIndex: -2,
  },
  '@keyframes glitch-1': {
    '0%, 14%, 15%, 49%, 50%, 99%, 100%': {
      transform: 'translate(0)',
    },
    '15%, 49%': {
      transform: 'translate(-2px, -1px)',
    },
  },
  '@keyframes glitch-2': {
    '0%, 20%, 21%, 62%, 63%, 99%, 100%': {
      transform: 'translate(0)',
    },
    '21%, 62%': {
      transform: 'translate(2px, 1px)',
    },
  },
}));

// Meteoric transition effect
export const MeteorTransition = styled(motion.div)`
  position: relative;
  overflow: hidden;
`;

// Floating Card wrapper with default props
export const SpaceCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <FloatingCard
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      }}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </FloatingCard>
  );
};
