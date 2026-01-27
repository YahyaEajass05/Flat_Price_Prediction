/**
 * Advanced Anime.js Animations
 * Using all powerful features from anime.js v3
 */
import anime from 'animejs'

/**
 * TIMELINE SEQUENCES
 * Orchestrate complex animation sequences
 */
export const createAdvancedTimeline = (options = {}) => {
  return anime.timeline({
    easing: 'easeOutExpo',
    duration: 750,
    autoplay: false,
    ...options,
  })
}

/**
 * SCROLL-TRIGGERED ANIMATIONS
 * Animate elements as they enter viewport
 */
export const scrollReveal = (selector, options = {}) => {
  const elements = document.querySelectorAll(selector)
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 1200,
            easing: 'easeOutExpo',
            ...options,
          })
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  elements.forEach((el) => observer.observe(el))
  return observer
}

/**
 * ADVANCED STAGGERING
 * Create stunning cascading effects
 */
export const staggerGrid = (selector, options = {}) => {
  return anime({
    targets: selector,
    scale: [0, 1],
    opacity: [0, 1],
    translateZ: 0,
    easing: 'easeOutExpo',
    duration: 600,
    delay: anime.stagger(100, { grid: [14, 5], from: 'center' }),
    ...options,
  })
}

export const staggerWave = (selector) => {
  return anime({
    targets: selector,
    translateY: [
      { value: -40, duration: 500 },
      { value: 0, duration: 800 },
    ],
    opacity: [0, 1],
    delay: anime.stagger(100, { from: 'first' }),
    easing: 'easeOutElastic(1, .5)',
  })
}

export const staggerSpiral = (selector) => {
  return anime({
    targets: selector,
    translateX: anime.stagger(10, { grid: [14, 5], from: 'center', axis: 'x' }),
    translateY: anime.stagger(10, { grid: [14, 5], from: 'center', axis: 'y' }),
    rotateZ: anime.stagger([0, 90], { grid: [14, 5], from: 'center', axis: 'x' }),
    delay: anime.stagger(200, { grid: [14, 5], from: 'center' }),
    easing: 'easeInOutQuad',
  })
}

/**
 * SVG LINE DRAWING
 * Animate SVG stroke
 */
export const drawSVGLine = (selector, options = {}) => {
  return anime({
    targets: selector,
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutSine',
    duration: 1500,
    direction: 'alternate',
    loop: false,
    ...options,
  })
}

/**
 * SVG SHAPE MORPHING
 * Morph between SVG paths
 */
export const morphSVGPath = (selector, pathData) => {
  return anime({
    targets: selector,
    d: [
      { value: pathData },
    ],
    easing: 'easeInOutQuad',
    duration: 2000,
    loop: true,
    direction: 'alternate',
  })
}

/**
 * INDIVIDUAL CSS TRANSFORMS
 * Animate individual transform properties
 */
export const transformCard3D = (selector) => {
  return anime({
    targets: selector,
    rotateY: '1turn',
    rotateX: '1turn',
    scale: [1, 1.2, 1],
    duration: 2000,
    easing: 'easeInOutQuad',
  })
}

export const perspectiveFlip = (selector) => {
  return anime({
    targets: selector,
    rotateX: [
      { value: 0, duration: 0 },
      { value: 90, duration: 400 },
      { value: 180, duration: 400 },
    ],
    scale: [
      { value: 1, duration: 0 },
      { value: 0.9, duration: 400 },
      { value: 1, duration: 400 },
    ],
    easing: 'easeInOutQuad',
  })
}

/**
 * MOTION PATH
 * Follow SVG motion path
 */
export const followMotionPath = (selector, pathEl) => {
  const path = anime.path(pathEl)
  
  return anime({
    targets: selector,
    translateX: path('x'),
    translateY: path('y'),
    rotate: path('angle'),
    easing: 'linear',
    duration: 3000,
    loop: true,
  })
}

/**
 * ELASTIC & SPRING ANIMATIONS
 * Physics-based animations
 */
export const elasticBounce = (selector) => {
  return anime({
    targets: selector,
    translateY: [
      { value: -100, easing: 'easeOutElastic(1, .8)' },
      { value: 0, easing: 'easeOutBounce' },
    ],
    duration: 2000,
  })
}

export const springAnimation = (selector) => {
  return anime({
    targets: selector,
    translateX: 250,
    scale: 2,
    rotate: '1turn',
    easing: 'spring(1, 80, 10, 0)',
    duration: 3000,
  })
}

/**
 * KEYFRAME ANIMATIONS
 * Multi-step animations
 */
export const complexKeyframes = (selector) => {
  return anime({
    targets: selector,
    keyframes: [
      { translateY: -40 },
      { translateX: 250 },
      { translateY: 40 },
      { translateX: 0 },
      { translateY: 0 },
    ],
    duration: 4000,
    easing: 'easeOutElastic(1, .8)',
    loop: true,
  })
}

/**
 * FUNCTION-BASED VALUES
 * Dynamic property values
 */
export const functionBasedAnimation = (selector) => {
  return anime({
    targets: selector,
    translateX: function(el, i) {
      return 50 + (i * 50)
    },
    rotate: function() {
      return anime.random(-360, 360)
    },
    scale: function(el, i, l) {
      return (l - i) + .25
    },
    delay: anime.stagger(50),
  })
}

/**
 * PROPERTY PARAMETERS
 * Different parameters for each property
 */
export const propertyParameters = (selector) => {
  return anime({
    targets: selector,
    translateX: {
      value: 250,
      duration: 800,
    },
    rotate: {
      value: 360,
      duration: 1800,
      easing: 'easeInOutSine',
    },
    scale: {
      value: 2,
      duration: 1600,
      delay: 800,
      easing: 'easeInOutQuart',
    },
    delay: 250,
  })
}

/**
 * SPECIFIC PROPERTY PARAMETERS
 * Control animation per property
 */
export const specificPropertyAnimation = (selector) => {
  return anime({
    targets: selector,
    translateX: [
      { value: 250, duration: 1000, delay: 500 },
      { value: 0, duration: 1000, delay: 500 },
    ],
    translateY: [
      { value: -40, duration: 500 },
      { value: 40, duration: 500, delay: 1000 },
      { value: 0, duration: 500, delay: 1000 },
    ],
    scaleX: [
      { value: 4, duration: 100, delay: 500, easing: 'easeOutExpo' },
      { value: 1, duration: 900 },
      { value: 4, duration: 100, delay: 500, easing: 'easeOutExpo' },
      { value: 1, duration: 900 },
    ],
    scaleY: [
      { value: [1.75, 1], duration: 500 },
      { value: 2, duration: 50, delay: 1000, easing: 'easeOutExpo' },
      { value: 1, duration: 450 },
      { value: 1.75, duration: 50, delay: 1000, easing: 'easeOutExpo' },
      { value: 1, duration: 450 },
    ],
    easing: 'easeOutElastic(1, .8)',
    loop: true,
  })
}

/**
 * RANGE VALUES
 * From-to animations
 */
export const rangeAnimation = (selector) => {
  return anime({
    targets: selector,
    translateX: [
      { value: -100, duration: 1200, delay: 500 },
      { value: 250, duration: 1000 },
      { value: 0, duration: 1000 },
    ],
    rotate: [0, 360],
    borderRadius: ['0%', '50%'],
    easing: 'easeInOutQuad',
  })
}

/**
 * TEXT ANIMATION
 * Wrap and animate text
 */
export const animateText = (selector) => {
  const textWrapper = document.querySelector(selector)
  if (textWrapper) {
    textWrapper.innerHTML = textWrapper.textContent.replace(
      /\S/g,
      "<span class='letter'>$&</span>"
    )
  }

  return anime.timeline({ loop: false })
    .add({
      targets: `${selector} .letter`,
      scale: [4, 1],
      opacity: [0, 1],
      translateZ: 0,
      easing: 'easeOutExpo',
      duration: 950,
      delay: (el, i) => 70 * i,
    })
}

/**
 * LAYERED ANIMATION
 * Multiple overlapping animations
 */
export const layeredAnimation = (selector) => {
  return anime.timeline({ loop: true })
    .add({
      targets: selector,
      translateX: [
        { value: 250, duration: 1000, delay: 500 },
        { value: 0, duration: 1000, delay: 500 },
      ],
    })
    .add({
      targets: selector,
      translateY: [
        { value: -40, duration: 500 },
        { value: 40, duration: 500, delay: 1000 },
        { value: 0, duration: 500, delay: 1000 },
      ],
    }, 0)
    .add({
      targets: selector,
      scaleX: [
        { value: 4, duration: 100, delay: 500, easing: 'easeOutExpo' },
        { value: 1, duration: 900 },
        { value: 4, duration: 100, delay: 500, easing: 'easeOutExpo' },
        { value: 1, duration: 900 },
      ],
    }, 0)
}

/**
 * CALLBACKS
 * Animation lifecycle hooks
 */
export const callbackAnimation = (selector, callbacks = {}) => {
  return anime({
    targets: selector,
    translateX: 270,
    delay: 1000,
    begin: (anim) => {
      console.log('Animation began')
      callbacks.onBegin?.(anim)
    },
    update: (anim) => {
      callbacks.onUpdate?.(anim)
    },
    complete: (anim) => {
      console.log('Animation completed')
      callbacks.onComplete?.(anim)
    },
  })
}

/**
 * PLAYBACK CONTROLS
 * Control animation playback
 */
export const controllableAnimation = (selector) => {
  const animation = anime({
    targets: selector,
    translateX: 270,
    autoplay: false,
  })

  return {
    animation,
    play: () => animation.play(),
    pause: () => animation.pause(),
    restart: () => animation.restart(),
    reverse: () => animation.reverse(),
    seek: (progress) => animation.seek(animation.duration * (progress / 100)),
  }
}

/**
 * DIRECTION AND LOOPING
 */
export const directionLoopAnimation = (selector) => {
  return anime({
    targets: selector,
    translateX: 250,
    rotate: 180,
    duration: 2000,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutQuad',
  })
}

export default {
  createAdvancedTimeline,
  scrollReveal,
  staggerGrid,
  staggerWave,
  staggerSpiral,
  drawSVGLine,
  morphSVGPath,
  transformCard3D,
  perspectiveFlip,
  followMotionPath,
  elasticBounce,
  springAnimation,
  complexKeyframes,
  functionBasedAnimation,
  propertyParameters,
  specificPropertyAnimation,
  rangeAnimation,
  animateText,
  layeredAnimation,
  callbackAnimation,
  controllableAnimation,
  directionLoopAnimation,
}
