/**
 * Anime.js Animation Utilities
 * Reusable animation functions for the application
 */
import anime from 'animejs'

/**
 * Fade in animation
 * @param {string|Element} targets - CSS selector or DOM element(s)
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before animation starts
 */
export const fadeIn = (targets, duration = 800, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [20, 0],
    duration,
    delay,
    easing: 'easeOutExpo',
  })
}

/**
 * Fade out animation
 */
export const fadeOut = (targets, duration = 600, delay = 0) => {
  return anime({
    targets,
    opacity: [1, 0],
    translateY: [0, -20],
    duration,
    delay,
    easing: 'easeInExpo',
  })
}

/**
 * Slide in from left
 */
export const slideInLeft = (targets, duration = 800, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [-50, 0],
    duration,
    delay,
    easing: 'easeOutExpo',
  })
}

/**
 * Slide in from right
 */
export const slideInRight = (targets, duration = 800, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [50, 0],
    duration,
    delay,
    easing: 'easeOutExpo',
  })
}

/**
 * Scale up animation
 */
export const scaleUp = (targets, duration = 600, delay = 0) => {
  return anime({
    targets,
    scale: [0.8, 1],
    opacity: [0, 1],
    duration,
    delay,
    easing: 'easeOutElastic(1, .5)',
  })
}

/**
 * Bounce animation
 */
export const bounce = (targets, duration = 1000) => {
  return anime({
    targets,
    translateY: [
      { value: -30, duration: duration / 3 },
      { value: 0, duration: duration / 3 },
      { value: -15, duration: duration / 6 },
      { value: 0, duration: duration / 6 },
    ],
    easing: 'easeOutBounce',
  })
}

/**
 * Rotate animation
 */
export const rotate = (targets, duration = 1000, degrees = 360) => {
  return anime({
    targets,
    rotate: degrees,
    duration,
    easing: 'easeInOutQuad',
  })
}

/**
 * Stagger animation for lists
 */
export const staggerFadeIn = (targets, duration = 800, staggerDelay = 100) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [30, 0],
    duration,
    delay: anime.stagger(staggerDelay),
    easing: 'easeOutExpo',
  })
}

/**
 * Card flip animation
 */
export const cardFlip = (targets, duration = 600) => {
  return anime({
    targets,
    rotateY: [0, 180],
    duration,
    easing: 'easeInOutQuad',
  })
}

/**
 * Pulse animation
 */
export const pulse = (targets, duration = 1000) => {
  return anime({
    targets,
    scale: [1, 1.05, 1],
    duration,
    loop: true,
    easing: 'easeInOutQuad',
  })
}

/**
 * Shake animation
 */
export const shake = (targets, duration = 500) => {
  return anime({
    targets,
    translateX: [
      { value: -10, duration: duration / 6 },
      { value: 10, duration: duration / 6 },
      { value: -10, duration: duration / 6 },
      { value: 10, duration: duration / 6 },
      { value: -5, duration: duration / 6 },
      { value: 0, duration: duration / 6 },
    ],
    easing: 'easeInOutSine',
  })
}

/**
 * Number counter animation
 */
export const countUp = (element, endValue, duration = 2000) => {
  const obj = { value: 0 }
  
  return anime({
    targets: obj,
    value: endValue,
    round: 1,
    duration,
    easing: 'easeOutExpo',
    update: () => {
      if (element) {
        element.textContent = Math.round(obj.value).toLocaleString()
      }
    },
  })
}

/**
 * Timeline animation for complex sequences
 */
export const createTimeline = (options = {}) => {
  return anime.timeline({
    easing: 'easeOutExpo',
    duration: 800,
    ...options,
  })
}

/**
 * Morphing animation for SVG paths
 */
export const morphPath = (targets, pathData, duration = 1000) => {
  return anime({
    targets,
    d: pathData,
    duration,
    easing: 'easeInOutQuad',
  })
}

/**
 * Text reveal animation
 */
export const textReveal = (targets, duration = 1000, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [20, 0],
    duration,
    delay: anime.stagger(50, { start: delay }),
    easing: 'easeOutExpo',
  })
}

/**
 * Loading dots animation
 */
export const loadingDots = (targets) => {
  return anime({
    targets,
    translateY: [0, -10, 0],
    duration: 600,
    delay: anime.stagger(100),
    loop: true,
    easing: 'easeInOutSine',
  })
}

/**
 * Gradient animation
 */
export const animateGradient = (targets, duration = 3000) => {
  return anime({
    targets,
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    duration,
    loop: true,
    easing: 'linear',
  })
}

/**
 * Button click effect
 */
export const buttonClick = (targets) => {
  return anime({
    targets,
    scale: [1, 0.95, 1],
    duration: 300,
    easing: 'easeInOutQuad',
  })
}

/**
 * Card entrance animation
 */
export const cardEntrance = (targets, index = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [50, 0],
    scale: [0.9, 1],
    duration: 800,
    delay: index * 100,
    easing: 'easeOutExpo',
  })
}

/**
 * Success animation (checkmark)
 */
export const successAnimation = (targets) => {
  return anime.timeline()
    .add({
      targets,
      scale: [0, 1],
      duration: 400,
      easing: 'easeOutBack',
    })
    .add({
      targets,
      rotate: [0, 360],
      duration: 600,
      easing: 'easeInOutQuad',
    }, '-=200')
}

/**
 * Error animation (X mark)
 */
export const errorAnimation = (targets) => {
  return anime({
    targets,
    translateX: [-10, 10, -10, 10, -5, 5, 0],
    duration: 500,
    easing: 'easeInOutSine',
  })
}

/**
 * Floating animation
 */
export const float = (targets) => {
  return anime({
    targets,
    translateY: [-10, 10],
    duration: 2000,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine',
  })
}

/**
 * Page transition animation
 */
export const pageTransition = {
  enter: (targets) => {
    return anime({
      targets,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      easing: 'easeOutExpo',
    })
  },
  exit: (targets) => {
    return anime({
      targets,
      opacity: [1, 0],
      translateY: [0, -20],
      duration: 400,
      easing: 'easeInExpo',
    })
  },
}

export default {
  fadeIn,
  fadeOut,
  slideInLeft,
  slideInRight,
  scaleUp,
  bounce,
  rotate,
  staggerFadeIn,
  cardFlip,
  pulse,
  shake,
  countUp,
  createTimeline,
  morphPath,
  textReveal,
  loadingDots,
  animateGradient,
  buttonClick,
  cardEntrance,
  successAnimation,
  errorAnimation,
  float,
  pageTransition,
}
