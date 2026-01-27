/**
 * Advanced Anime.js Showcase
 * Demonstrates all powerful features from anime.js documentation
 */
import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import {
  scrollReveal,
  staggerGrid,
  staggerWave,
  drawSVGLine,
  morphSVGPath,
  transformCard3D,
  elasticBounce,
  springAnimation,
  complexKeyframes,
  propertyParameters,
  animateText,
  layeredAnimation,
  controllableAnimation,
  createAdvancedTimeline,
} from '../utils/advancedAnimations'

const AdvancedAnimationShowcase = () => {
  const [progress, setProgress] = useState(0)
  const [animationController, setAnimationController] = useState(null)
  
  const textRef = useRef(null)
  const svgLineRef = useRef(null)
  const morphRef = useRef(null)
  const card3DRef = useRef(null)
  const elasticRef = useRef(null)
  const springRef = useRef(null)
  const keyframesRef = useRef(null)
  const propertyRef = useRef(null)
  const layeredRef = useRef(null)
  const controllableRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    // Initialize scroll-triggered animations
    scrollReveal('.scroll-reveal')
    
    // Initialize text animation
    if (textRef.current) {
      animateText('.animated-text')
    }

    // Initialize controllable animation
    if (controllableRef.current) {
      const controller = controllableAnimation('.controllable-box')
      setAnimationController(controller)
    }

    // Stagger grid on mount
    setTimeout(() => {
      staggerGrid('.grid-item')
    }, 500)
  }, [])

  const handleSVGLineDraw = () => {
    drawSVGLine('.svg-animated-line')
  }

  const handleMorphSVG = () => {
    const paths = [
      'M50,50 L150,50 L150,150 L50,150 Z',
      'M100,25 L175,100 L100,175 L25,100 Z',
      'M100,25 Q175,100 100,175 Q25,100 100,25 Z',
      'M100,50 A50,50 0 1,1 100,150 A50,50 0 1,1 100,50 Z',
    ]
    const randomPath = paths[Math.floor(Math.random() * paths.length)]
    morphSVGPath('.morph-shape', randomPath)
  }

  const handle3DTransform = () => {
    transformCard3D(card3DRef.current)
  }

  const handleElastic = () => {
    elasticBounce(elasticRef.current)
  }

  const handleSpring = () => {
    springAnimation(springRef.current)
  }

  const handleKeyframes = () => {
    complexKeyframes(keyframesRef.current)
  }

  const handlePropertyParams = () => {
    propertyParameters(propertyRef.current)
  }

  const handleLayered = () => {
    layeredAnimation(layeredRef.current)
  }

  const handleTimeline = () => {
    const tl = createAdvancedTimeline({ autoplay: true })
    
    tl.add({
      targets: '.timeline-1',
      translateX: 250,
      duration: 800,
    })
    .add({
      targets: '.timeline-2',
      translateX: 250,
      duration: 800,
    }, '-=600')
    .add({
      targets: '.timeline-3',
      translateX: 250,
      duration: 800,
    }, '-=600')
    .add({
      targets: ['.timeline-1', '.timeline-2', '.timeline-3'],
      translateX: 0,
      duration: 800,
    })
  }

  const handleStaggerWave = () => {
    staggerWave('.wave-item')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 ref={textRef} className="animated-text text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Advanced Anime.js
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Showcasing all powerful features from the official documentation
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-16 pb-20">
        
        {/* 1. STAGGER GRID ANIMATION */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">📊 Advanced Staggering - Grid Layout</h2>
          <p className="text-gray-600 mb-6">Items animate from center with grid-based stagger delay</p>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="grid-item w-full h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg opacity-0"
              />
            ))}
          </div>
        </section>

        {/* 2. STAGGER WAVE */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">🌊 Stagger Wave Animation</h2>
          <p className="text-gray-600 mb-6">Elastic wave effect with sequential delay</p>
          <div className="flex gap-2 justify-center">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="wave-item w-12 h-32 bg-gradient-to-t from-green-500 to-blue-500 rounded-lg"
              />
            ))}
          </div>
          <button onClick={handleStaggerWave} className="btn btn-primary mt-6">
            Trigger Wave
          </button>
        </section>

        {/* 3. SVG LINE DRAWING */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">✏️ SVG Line Drawing</h2>
          <p className="text-gray-600 mb-6">Animate stroke-dashoffset to draw lines</p>
          <svg ref={svgLineRef} width="100%" height="200" viewBox="0 0 800 200">
            <path
              className="svg-animated-line"
              d="M 50 100 Q 200 50 400 100 T 750 100"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
          <button onClick={handleSVGLineDraw} className="btn btn-primary mt-4">
            Draw Line
          </button>
        </section>

        {/* 4. SVG SHAPE MORPHING */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">🔄 SVG Shape Morphing</h2>
          <p className="text-gray-600 mb-6">Morph between different SVG path shapes</p>
          <div className="flex justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <path
                ref={morphRef}
                className="morph-shape"
                d="M50,50 L150,50 L150,150 L50,150 Z"
                fill="url(#morphGradient)"
              />
              <defs>
                <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f093fb" />
                  <stop offset="100%" stopColor="#f5576c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <button onClick={handleMorphSVG} className="btn btn-primary mt-4">
            Morph Shape
          </button>
        </section>

        {/* 5. 3D TRANSFORMS */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">🎲 Individual CSS Transforms (3D)</h2>
          <p className="text-gray-600 mb-6">Animate individual transform properties independently</p>
          <div className="flex justify-center">
            <div
              ref={card3DRef}
              className="w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-2xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ perspective: '1000px' }}
            >
              3D Card
            </div>
          </div>
          <button onClick={handle3DTransform} className="btn btn-primary mt-6">
            3D Transform
          </button>
        </section>

        {/* 6. ELASTIC & SPRING */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">🎾 Physics-Based Animations</h2>
          <p className="text-gray-600 mb-6">Elastic and spring easing functions</p>
          <div className="flex gap-8 justify-center">
            <div>
              <div
                ref={elasticRef}
                className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
              >
                Elastic
              </div>
              <button onClick={handleElastic} className="btn btn-secondary mt-4">
                Bounce
              </button>
            </div>
            <div>
              <div
                ref={springRef}
                className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
              >
                Spring
              </div>
              <button onClick={handleSpring} className="btn btn-secondary mt-4">
                Spring
              </button>
            </div>
          </div>
        </section>

        {/* 7. KEYFRAMES */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">🎹 Flexible Keyframes System</h2>
          <p className="text-gray-600 mb-6">Multi-step animations with keyframe arrays</p>
          <div className="flex justify-center">
            <div
              ref={keyframesRef}
              className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg"
            />
          </div>
          <button onClick={handleKeyframes} className="btn btn-primary mt-6">
            Play Keyframes
          </button>
        </section>

        {/* 8. PROPERTY PARAMETERS */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">⚙️ Per Property Parameters</h2>
          <p className="text-gray-600 mb-6">Different duration, delay, and easing for each property</p>
          <div className="flex justify-center">
            <div
              ref={propertyRef}
              className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg"
            />
          </div>
          <button onClick={handlePropertyParams} className="btn btn-primary mt-6">
            Animate Properties
          </button>
        </section>

        {/* 9. LAYERED ANIMATIONS */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">🎬 Layered Timeline Animation</h2>
          <p className="text-gray-600 mb-6">Multiple overlapping animations on timeline</p>
          <div className="flex justify-center">
            <div
              ref={layeredRef}
              className="w-32 h-32 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg"
            />
          </div>
          <button onClick={handleLayered} className="btn btn-primary mt-6">
            Play Layered
          </button>
        </section>

        {/* 10. CONTROLLABLE ANIMATION */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">🎮 Playback Controls</h2>
          <p className="text-gray-600 mb-6">Control animation with play, pause, seek, reverse</p>
          <div className="flex justify-center mb-6">
            <div
              ref={controllableRef}
              className="controllable-box w-32 h-32 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg"
            />
          </div>
          {animationController && (
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={animationController.play} className="btn btn-primary">
                ▶️ Play
              </button>
              <button onClick={animationController.pause} className="btn btn-secondary">
                ⏸️ Pause
              </button>
              <button onClick={animationController.restart} className="btn btn-secondary">
                🔄 Restart
              </button>
              <button onClick={animationController.reverse} className="btn btn-secondary">
                ⏪ Reverse
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  setProgress(e.target.value)
                  animationController.seek(e.target.value)
                }}
                className="w-48"
              />
            </div>
          )}
        </section>

        {/* 11. TIMELINE SEQUENCE */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">⏱️ Timeline Orchestration</h2>
          <p className="text-gray-600 mb-6">Synchronize multiple animations with advanced positioning</p>
          <div className="space-y-4">
            <div className="timeline-1 w-32 h-16 bg-blue-500 rounded-lg"></div>
            <div className="timeline-2 w-32 h-16 bg-green-500 rounded-lg"></div>
            <div className="timeline-3 w-32 h-16 bg-red-500 rounded-lg"></div>
          </div>
          <button onClick={handleTimeline} className="btn btn-primary mt-6">
            Play Timeline Sequence
          </button>
        </section>

        {/* 12. SCROLL-TRIGGERED */}
        <section className="scroll-reveal">
          <h2 className="text-4xl font-bold mb-6">📜 Scroll Observer</h2>
          <p className="text-gray-600 mb-6">All sections on this page use scroll-triggered animations!</p>
          <div className="card bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-8">
            <p className="text-xl">
              Scroll up and down to see sections animate as they enter the viewport using IntersectionObserver API
            </p>
          </div>
        </section>

        {/* Feature Summary */}
        <section className="scroll-reveal">
          <div className="card bg-white">
            <h2 className="text-3xl font-bold mb-6">✨ Features Demonstrated</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                '✅ Per property parameters',
                '✅ Flexible keyframes system',
                '✅ Built-in easings (elastic, spring)',
                '✅ Individual CSS transforms',
                '✅ Advanced staggering (grid, wave)',
                '✅ SVG line drawing',
                '✅ SVG shape morphing',
                '✅ Timeline sequences',
                '✅ Playback controls',
                '✅ Scroll observer',
                '✅ Function-based values',
                '✅ Layered animations',
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdvancedAnimationShowcase
