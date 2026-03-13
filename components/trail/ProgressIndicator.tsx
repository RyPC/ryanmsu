'use client'

import { motion } from 'framer-motion'

interface ProgressIndicatorProps {
  progress: number
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const distance = Math.floor(progress * 8.4) // miles
  const elevation = Math.floor(progress * 2400) // feet
  const projects = Math.min(9, Math.floor(progress * 12))
  const technologies = Math.min(18, Math.floor(progress * 22))

  return (
    <div className="fixed top-4 right-4 md:right-8 z-40 pointer-events-none">
      <div className="inline-flex flex-wrap gap-4 md:gap-6 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50">
        <Stat label="Miles" value={distance} unit=" mi" />
        <Stat label="Elevation" value={elevation} unit=" ft" />
        <Stat label="Projects" value={projects} />
        <Stat label="Techs" value={technologies} />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  unit = '',
}: {
  label: string
  value: number
  unit?: string
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-amber-700/80 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-lg font-bold text-amber-900">
        <motion.span
          key={value}
          initial={{ opacity: 0.7, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.span>
        {unit}
      </span>
    </div>
  )
}
