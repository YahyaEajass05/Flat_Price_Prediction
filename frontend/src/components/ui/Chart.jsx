import { cn } from '../../utils/helpers'

// Line Chart Component
export function LineChart({ data = [], height = 200, color = '#0ea5e9', showGrid = true, animated = true }) {
  if (!data.length) return null

  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((d.value - min) / range) * 80 // 80% of height for data, 20% padding
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" className={cn('w-full', `h-${height}`)} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {showGrid && (
          <>
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.2"/>
            ))}
          </>
        )}
        
        {/* Area under line */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#lineGradient)"
          className={animated ? 'animate-pulse-slow' : ''}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = 100 - ((d.value - min) / range) * 80
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="1.5" fill={color}>
                {animated && (
                  <animate
                    attributeName="r"
                    values="1.5;2.5;1.5"
                    dur="2s"
                    begin={`${i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Bar Chart Component
export function BarChart({ data = [], height = 200, color = '#0ea5e9', showValues = false }) {
  if (!data.length) return null

  const max = Math.max(...data.map(d => d.value))
  const barWidth = 100 / data.length
  const gap = barWidth * 0.2

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" className={cn('w-full', `h-${height}`)}>
        {data.map((d, i) => {
          const height = (d.value / max) * 80
          const x = i * barWidth + gap
          const y = 100 - height - 10
          
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth - gap * 2}
                height={height}
                fill={color}
                rx="1"
                className="transition-all duration-500"
              >
                <animate
                  attributeName="height"
                  from="0"
                  to={height}
                  dur="1s"
                  fill="freeze"
                />
                <animate
                  attributeName="y"
                  from="90"
                  to={y}
                  dur="1s"
                  fill="freeze"
                />
              </rect>
              {showValues && (
                <text
                  x={x + (barWidth - gap * 2) / 2}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize="4"
                  fill="#6b7280"
                >
                  {d.value}
                </text>
              )}
              <text
                x={x + (barWidth - gap * 2) / 2}
                y="98"
                textAnchor="middle"
                fontSize="3"
                fill="#9ca3af"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Donut Chart Component
export function DonutChart({ data = [], size = 200, thickness = 20, showLegend = true }) {
  if (!data.length) return null

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = 50 - thickness / 2
  const circumference = 2 * Math.PI * radius
  
  let currentAngle = -90
  const segments = data.map((d) => {
    const percentage = (d.value / total) * 100
    const dashArray = `${(percentage / 100) * circumference} ${circumference}`
    const rotation = currentAngle
    currentAngle += (percentage / 100) * 360
    
    return {
      ...d,
      percentage,
      dashArray,
      rotation
    }
  })

  return (
    <div className="flex flex-col items-center space-y-4">
      <svg viewBox="0 0 100 100" className={cn('w-full max-w-xs')} style={{ height: size }}>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={thickness}
        />
        
        {segments.map((segment, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={thickness}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={circumference / 4}
            transform={`rotate(${segment.rotation} 50 50)`}
            className="transition-all duration-500"
          />
        ))}
        
        <text x="50" y="48" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#111827">
          {total}
        </text>
        <text x="50" y="56" textAnchor="middle" fontSize="4" fill="#6b7280">
          Total
        </text>
      </svg>
      
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-700">
                {segment.label}: <span className="font-semibold">{segment.value}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Area Chart Component
export function AreaChart({ data = [], height = 200, color = '#0ea5e9', showGrid = true }) {
  if (!data.length) return null

  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((d.value - min) / range) * 80
    return { x, y, ...d }
  })

  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" className={cn('w-full', `h-${height}`)} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        
        {showGrid && (
          <>
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.2"/>
            ))}
          </>
        )}
        
        <path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill="url(#areaGradient)"
        />
        
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
