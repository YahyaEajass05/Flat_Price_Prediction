import { useEffect, useRef } from 'react'
import { loadingDots } from '../../utils/animations'

const Loading = ({ message = 'Loading...' }) => {
  const dotsRef = useRef(null)

  useEffect(() => {
    if (dotsRef.current) {
      loadingDots(dotsRef.current.children)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="spinner mb-4"></div>
      <p className="text-gray-600 mb-2">{message}</p>
      <div ref={dotsRef} className="flex gap-2">
        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
      </div>
    </div>
  )
}

export default Loading
