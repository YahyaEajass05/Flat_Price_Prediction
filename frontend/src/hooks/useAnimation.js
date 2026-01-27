/**
 * Custom hook for Anime.js animations
 */
import { useEffect, useRef } from 'react'
import animations from '../utils/animations'

/**
 * Hook to trigger animation on mount
 * @param {string} animationType - Type of animation from animations utils
 * @param {object} options - Animation options
 */
export const useAnimation = (animationType = 'fadeIn', options = {}) => {
  const elementRef = useRef(null)

  useEffect(() => {
    if (elementRef.current && animations[animationType]) {
      animations[animationType](elementRef.current, options.duration, options.delay)
    }
  }, [animationType, options.duration, options.delay])

  return elementRef
}

/**
 * Hook for stagger animations on lists
 */
export const useStaggerAnimation = (items, delay = 100) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      const children = containerRef.current.children
      animations.staggerFadeIn(children, 800, delay)
    }
  }, [items, delay])

  return containerRef
}

/**
 * Hook for scroll-triggered animations
 */
export const useScrollAnimation = (animationType = 'fadeIn', threshold = 0.1) => {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && animations[animationType]) {
            animations[animationType](entry.target)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [animationType, threshold])

  return elementRef
}

/**
 * Hook for hover animations
 */
export const useHoverAnimation = (hoverAnimation = 'scaleUp', normalAnimation = null) => {
  const elementRef = useRef(null)

  const handleMouseEnter = () => {
    if (elementRef.current && animations[hoverAnimation]) {
      animations[hoverAnimation](elementRef.current, 300)
    }
  }

  const handleMouseLeave = () => {
    if (elementRef.current && normalAnimation && animations[normalAnimation]) {
      animations[normalAnimation](elementRef.current, 300)
    }
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hoverAnimation, normalAnimation])

  return elementRef
}

/**
 * Hook for click animations
 */
export const useClickAnimation = (clickAnimation = 'buttonClick') => {
  const elementRef = useRef(null)

  const handleClick = () => {
    if (elementRef.current && animations[clickAnimation]) {
      animations[clickAnimation](elementRef.current)
    }
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('click', handleClick)

    return () => {
      element.removeEventListener('click', handleClick)
    }
  }, [clickAnimation])

  return elementRef
}

export default useAnimation
