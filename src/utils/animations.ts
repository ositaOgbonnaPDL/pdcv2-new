/**
 * Animation Utilities
 * Helper functions and constants for animations using Reanimated and Moti
 */

import {Easing} from 'react-native-reanimated';

/**
 * Animation durations (in milliseconds)
 */
export const AnimationDuration = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  VERY_SLOW: 500,
} as const;

/**
 * Animation easings
 * Using Reanimated's Easing functions
 */
export const AnimationEasing = {
  LINEAR: Easing.linear,
  EASE_IN: Easing.in(Easing.ease),
  EASE_OUT: Easing.out(Easing.ease),
  EASE_IN_OUT: Easing.inOut(Easing.ease),
  BEZIER: Easing.bezier(0.25, 0.1, 0.25, 1),
  SPRING: Easing.elastic(1),
  BOUNCE: Easing.bounce,
} as const;

/**
 * Common animation presets for Moti
 */
export const MotiPresets = {
  /**
   * Fade in animation
   */
  fadeIn: {
    from: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
  },

  /**
   * Fade out animation
   */
  fadeOut: {
    from: {
      opacity: 1,
    },
    animate: {
      opacity: 0,
    },
  },

  /**
   * Scale up animation
   */
  scaleUp: {
    from: {
      scale: 0,
    },
    animate: {
      scale: 1,
    },
  },

  /**
   * Scale down animation
   */
  scaleDown: {
    from: {
      scale: 1,
    },
    animate: {
      scale: 0,
    },
  },

  /**
   * Slide in from right
   */
  slideInRight: {
    from: {
      translateX: 100,
      opacity: 0,
    },
    animate: {
      translateX: 0,
      opacity: 1,
    },
  },

  /**
   * Slide in from left
   */
  slideInLeft: {
    from: {
      translateX: -100,
      opacity: 0,
    },
    animate: {
      translateX: 0,
      opacity: 1,
    },
  },

  /**
   * Slide in from top
   */
  slideInTop: {
    from: {
      translateY: -100,
      opacity: 0,
    },
    animate: {
      translateY: 0,
      opacity: 1,
    },
  },

  /**
   * Slide in from bottom
   */
  slideInBottom: {
    from: {
      translateY: 100,
      opacity: 0,
    },
    animate: {
      translateY: 0,
      opacity: 1,
    },
  },

  /**
   * Press animation (for touchables)
   */
  press: {
    from: {
      scale: 1,
      opacity: 1,
    },
    animate: {
      scale: 0.95,
      opacity: 0.8,
    },
  },

  /**
   * Bounce animation
   */
  bounce: {
    from: {
      scale: 1,
    },
    animate: {
      scale: [1, 1.1, 0.9, 1.05, 1],
    },
  },

  /**
   * Shake animation
   */
  shake: {
    from: {
      translateX: 0,
    },
    animate: {
      translateX: [-10, 10, -10, 10, 0],
    },
  },

  /**
   * Pulse animation
   */
  pulse: {
    from: {
      scale: 1,
      opacity: 1,
    },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    },
  },

  /**
   * Rotate animation
   */
  rotate: {
    from: {
      rotate: '0deg',
    },
    animate: {
      rotate: '360deg',
    },
  },
} as const;

/**
 * Transition configurations for Moti
 */
export const MotiTransitions = {
  /**
   * Fast spring transition
   */
  spring: {
    type: 'spring' as const,
    damping: 15,
    stiffness: 150,
  },

  /**
   * Smooth spring transition
   */
  smoothSpring: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 100,
  },

  /**
   * Timing transition
   */
  timing: {
    type: 'timing' as const,
    duration: AnimationDuration.NORMAL,
  },

  /**
   * Fast timing transition
   */
  fastTiming: {
    type: 'timing' as const,
    duration: AnimationDuration.FAST,
  },

  /**
   * Slow timing transition
   */
  slowTiming: {
    type: 'timing' as const,
    duration: AnimationDuration.SLOW,
  },
} as const;

/**
 * Create a delay transition
 */
export const createDelayTransition = (
  delay: number,
  type: 'spring' | 'timing' = 'timing',
) => ({
  type,
  delay,
  ...(type === 'timing' && {duration: AnimationDuration.NORMAL}),
  ...(type === 'spring' && {damping: 15, stiffness: 150}),
});

/**
 * Create a stagger animation delay
 * Useful for animating lists
 */
export const createStaggerDelay = (index: number, staggerMs: number = 50) => {
  return index * staggerMs;
};

/**
 * Animation state types for components
 */
export type AnimationState = 'entering' | 'entered' | 'exiting' | 'exited';

/**
 * Create exit animation variant
 */
export const createExitVariant = (enterVariant: any) => {
  return {
    from: enterVariant.animate,
    animate: enterVariant.from,
  };
};

/**
 * Loop animation configuration
 */
export const createLoopAnimation = (
  animation: any,
  iterations: number = Infinity,
) => ({
  ...animation,
  transition: {
    ...animation.transition,
    loop: iterations === Infinity,
    repeatReverse: true,
  },
});
