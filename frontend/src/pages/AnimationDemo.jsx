/**
 * Animation Demo Page - Showcases all Anime.js animations
 * Navigate to /demo to see this page
 */
import { useRef, useState } from 'react'
import anime from 'animejs'
import {
  fadeIn,
  fadeOut,
  slideInLeft,
  slideInRight,
  scaleUp,
  bounce,
  rotate,
  staggerFadeIn,
  pulse,
  shake,
  countUp,
  float,
  buttonClick,
  successAnimation,
  errorAnimation,
} from '../utils/animations'

const AnimationDemo = () => {
  const [counter, setCounter] = useState(0)
  const fadeRef = useRef(null)
  const slideLeftRef = useRef(null)
  const slideRightRef = useRef(null)
  const scaleRef = useRef(null)
  const bounceRef = useRef(null)
  const rotateRef = useRef(null)
  const pulseRef = useRef(null)
  const shakeRef = useRef(null)
  const floatRef = useRef(null)
  const counterRef = useRef(null)
  const staggerRef = useRef(null)
  const successRef = useRef(null)
  const errorRef = useRef(null)

  const demos = [
    {
      name: 'Fade In',
      ref: fadeRef,
      action: () => fadeIn(fadeRef.current, 800),
      color: 'bg-blue-500',
    },
    {
      name: 'Slide Left',
      ref: slideLeftRef,
      action: () => slideInLeft(slideLeftRef.current, 800),
      color: 'bg-green-500',
    },
    {
      name: 'Slide Right',
      ref: slideRightRef,
      action: () => slideInRight(slideRightRef.current, 800),
      color: 'bg-purple-500',
    },
    {
      name: 'Scale Up',
      ref: scaleRef,
      action: () => scaleUp(scaleRef.current, 600),
      color: 'bg-pink-500',
    },
    {
      name: 'Bounce',
      ref: bounceRef,
      action: () => bounce(bounceRef.current, 1000),
      color: 'bg-yellow-500',
    },
    {
      name: 'Rotate 360°',
      ref: rotateRef,
      action: () => rotate(rotateRef.current, 1000, 360),
      color: 'bg-red-500',
    },
    {
      name: 'Pulse',
      ref: pulseRef,
      action: () => pulse(pulseRef.current, 1000),
      color: 'bg-indigo-500',
    },
    {
      name: 'Shake',
      ref: shakeRef,
      action: () => shake(shakeRef.current, 500),
      color: 'bg-orange-500',
    },
    {
      name: 'Float',
      ref: floatRef,
      action: () => float(floatRef.current),
      color: 'bg-teal-500',
    },
    {
      name: 'Success',
      ref: successRef,
      action: () => successAnimation(successRef.current),
      color: 'bg-green-600',
    },
    {
      name: 'Error',
      ref: errorRef,
      action: () => errorAnimation(errorRef.current),
      color: 'bg-red-600',
    },
  ]

  const handleCountUp = () => {
    setCounter(Math.floor(Math.random() * 10000))
    countUp(counterRef.current, Math.floor(Math.random() * 10000), 2000)
  }

  const handleStagger = () => {
    if (staggerRef.current) {
      staggerFadeIn(staggerRef.current.children, 600, 100)
    }
  }

  const handleComplexAnimation = () => {
    // Complex timeline animation
    const tl = anime.timeline({
      easing: 'easeOutExpo',
      duration: 750,
    })

    tl.add({
      targets: '.complex-box',
      translateX: 250,
      backgroundColor: '#FF6B6B',
    })
      .add({
        targets: '.complex-box',
        translateY: 100,
        backgroundColor: '#4ECDC4',
      })
      .add({
        targets: '.complex-box',
        rotate: '1turn',
        backgroundColor: '#45B7D1',
      })
      .add({
        targets: '.complex-box',
        translateX: 0,
        translateY: 0,
        rotate: 0,
        backgroundColor: '#96CEB4',
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient">
            🎬 Anime.js Animation Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Click on any box to see the animation in action!
          </p>
        </div>

        {/* Basic Animations Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Basic Animations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {demos.map((demo, index) => (
              <div
                key={index}
                onClick={demo.action}
                ref={demo.ref}
                className={`${demo.color} text-white p-8 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-shadow flex items-center justify-center text-center font-bold text-lg`}
              >
                {demo.name}
              </div>
            ))}
          </div>
        </div>

        {/* Counter Animation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Number Counter Animation</h2>
          <div className="card bg-white">
            <div className="text-center">
              <div
                ref={counterRef}
                className="text-6xl font-bold text-primary-600 mb-4"
              >
                0
              </div>
              <button onClick={handleCountUp} className="btn btn-primary">
                Count Up to Random Number
              </button>
            </div>
          </div>
        </div>

        {/* Stagger Animation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Stagger List Animation</h2>
          <div className="card bg-white">
            <div ref={staggerRef}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-4 mb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg opacity-0"
                >
                  List Item {i} - Will animate with delay
                </div>
              ))}
            </div>
            <button onClick={handleStagger} className="btn btn-primary mt-4">
              Trigger Stagger Animation
            </button>
          </div>
        </div>

        {/* Complex Timeline Animation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Complex Timeline Animation</h2>
          <div className="card bg-white">
            <div className="flex flex-col items-center gap-6">
              <div className="complex-box w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg"></div>
              <button onClick={handleComplexAnimation} className="btn btn-primary">
                Play Complex Animation
              </button>
              <p className="text-gray-600 text-center">
                This box will move right, down, rotate, and return to start
              </p>
            </div>
          </div>
        </div>

        {/* SVG Path Animation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">SVG Path Animation</h2>
          <div className="card bg-white">
            <svg
              width="100%"
              height="200"
              viewBox="0 0 800 200"
              onClick={() => {
                anime({
                  targets: '.svg-line',
                  strokeDashoffset: [anime.setDashoffset, 0],
                  easing: 'easeInOutSine',
                  duration: 2000,
                  direction: 'alternate',
                  loop: false,
                })
              }}
            >
              <path
                className="svg-line"
                d="M 50 100 Q 200 50 400 100 T 750 100"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="4"
              />
            </svg>
            <p className="text-center text-gray-600 mt-4">Click the SVG to animate the line</p>
          </div>
        </div>

        {/* Button Click Animation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Interactive Button Animations</h2>
          <div className="card bg-white">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={(e) => buttonClick(e.currentTarget)}
                className="btn btn-primary px-8 py-4 text-lg"
              >
                Click Me! (Scale Effect)
              </button>
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                    duration: 600,
                  })
                }}
                className="btn btn-secondary px-8 py-4 text-lg"
              >
                Spin & Scale!
              </button>
              <button
                onClick={(e) => {
                  anime({
                    targets: e.currentTarget,
                    scale: [1, 0.9, 1.1, 1],
                    duration: 300,
                    easing: 'easeInOutQuad',
                  })
                }}
                className="btn btn-success px-8 py-4 text-lg"
              >
                Bounce Click!
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <h3 className="text-2xl font-bold mb-4">💡 How to Use These Animations</h3>
          <div className="space-y-2 text-white/90">
            <p>
              • All these animations are available in <code className="bg-white/20 px-2 py-1 rounded">src/utils/animations.js</code>
            </p>
            <p>
              • Import them in any component: <code className="bg-white/20 px-2 py-1 rounded">import &#123; fadeIn &#125; from '@/utils/animations'</code>
            </p>
            <p>
              • Use refs to target elements: <code className="bg-white/20 px-2 py-1 rounded">fadeIn(elementRef.current, 800)</code>
            </p>
            <p>
              • Custom hooks available: <code className="bg-white/20 px-2 py-1 rounded">useAnimation, useScrollAnimation</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnimationDemo
