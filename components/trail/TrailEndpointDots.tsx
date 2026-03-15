import type { KeyboardEvent } from 'react'
import type { Checkpoint } from '@/data/experiences'
import { getTrailXAtProgress, locationToScrollProgress } from '@/lib/trailPath'
import {
  BRANCH_DEFAULT_X_OFFSET,
  BRANCH_DEFAULT_Y_OFFSET,
  BRANCH_LENGTH_MIN,
  BRANCH_LENGTH_MAX,
  VIEW_WINDOW_HEIGHT,
  TRAIL_PATH_MIN_Y,
  TRAIL_PATH_MAX_Y,
} from '@/lib/constants'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

interface TrailEndpointDotsProps {
  checkpoints: Checkpoint[]
  pathRef: React.RefObject<SVGPathElement>
  viewY: number
  heroHeight: number
  trailProgressHeight: number
  onOpenSideTrail: (checkpoint: Checkpoint) => void
}

export function TrailEndpointDots({
  checkpoints,
  pathRef,
  viewY,
  heroHeight,
  trailProgressHeight,
  onOpenSideTrail,
}: TrailEndpointDotsProps) {
  return (
    <>
      {checkpoints.map((checkpoint) => {
        if (!checkpoint.sideTrail || !checkpoint.sideTrailId) return null

        const endpointSide = checkpoint.sideTrailEndpoint?.side ?? 'right'
        const sideSign = endpointSide === 'left' ? -1 : 1
        const branchLength = clamp(checkpoint.branchLength ?? 1.0, BRANCH_LENGTH_MIN, BRANCH_LENGTH_MAX)
        const xOffset = (checkpoint.sideTrailEndpoint?.xOffset ?? BRANCH_DEFAULT_X_OFFSET) * branchLength
        const yOffset = (checkpoint.sideTrailEndpoint?.yOffset ?? BRANCH_DEFAULT_Y_OFFSET) * branchLength

        const branchStartProgress = locationToScrollProgress(
          checkpoint.locationOnTrail,
          heroHeight,
          trailProgressHeight,
        )

        const fallbackStartX = getTrailXAtProgress(branchStartProgress)
        const fallbackStartY = branchStartProgress * TRAIL_PATH_MAX_Y
        let startX = fallbackStartX
        let startY = fallbackStartY

        const path = pathRef.current
        if (path) {
          const startPoint = path.getPointAtLength(clamp(branchStartProgress, 0, 1) * path.getTotalLength())
          startX = startPoint.x
          startY = startPoint.y
        }

        const endpointX = clamp(startX + sideSign * xOffset, 16, 784)
        const endpointY = clamp(startY + yOffset, TRAIL_PATH_MIN_Y, TRAIL_PATH_MAX_Y)

        if (endpointY < viewY - 120 || endpointY > viewY + VIEW_WINDOW_HEIGHT + 120) {
          return null
        }

        const label = checkpoint.sideTrailEndpoint?.label ?? checkpoint.title
        const labelWidth = clamp(64 + label.length * 6.8, 110, 220)
        const labelHeight = 30
        const labelX = endpointSide === 'left' ? endpointX - labelWidth - 12 : endpointX + 12
        const labelY = endpointY - labelHeight / 2

        const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpenSideTrail(checkpoint)
          }
        }

        return (
          <g
            key={checkpoint.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpenSideTrail(checkpoint)}
            onKeyDown={onKeyDown}
            className="pointer-events-auto cursor-pointer focus:outline-none"
            aria-label={`Open side trail for ${label}`}
          >
            <circle cx={endpointX} cy={endpointY} r={7} fill="#7c3aed" stroke="#ffffff" strokeWidth={2} />
            <circle cx={endpointX} cy={endpointY} r={11} fill="none" stroke="#8b5cf6" strokeOpacity={0.6} />
            <rect
              x={labelX}
              y={labelY}
              width={labelWidth}
              height={labelHeight}
              rx={8}
              fill="rgba(255,255,255,0.94)"
              stroke="rgba(167,139,250,0.75)"
            />
            <text
              x={labelX + labelWidth / 2}
              y={endpointY + 5}
              textAnchor="middle"
              className="select-none fill-violet-900 text-[13px] font-medium"
            >
              {label}
            </text>
          </g>
        )
      })}
    </>
  )
}
