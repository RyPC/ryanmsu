"use client"

import { useEffect, useState } from "react"
import { useSpring, useMotionValueEvent } from "framer-motion"
import { TOPO_PATHS } from "@/data/topoPaths"

const VIEW_WINDOW_HEIGHT = 1400
const TRAIL_PATH_MAX_Y = 4000
const HALF_VIEW = VIEW_WINDOW_HEIGHT / 2

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v))
}

interface TopographyBackgroundProps {
    progress: number
}

export function TopographyBackground({ progress }: TopographyBackgroundProps) {
    // Approximate marker Y as progress * TRAIL_PATH_MAX_Y, then center in the view window.
    // Small drift vs. TrailLayer's exact path geometry is acceptable for a background element.
    const targetViewY = clamp(
        progress * TRAIL_PATH_MAX_Y - HALF_VIEW,
        -HALF_VIEW,
        TRAIL_PATH_MAX_Y - HALF_VIEW,
    )

    const viewYSpring = useSpring(targetViewY, {
        stiffness: 80,
        damping: 20,
        restDelta: 0.5,
    })
    const [viewY, setViewY] = useState(targetViewY)

    useEffect(() => {
        viewYSpring.set(targetViewY)
    }, [targetViewY, viewYSpring])

    useMotionValueEvent(viewYSpring, "change", (v) => setViewY(v))

    return (
        <div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
            aria-hidden="true"
        >
            <svg
                // xMidYMid slice fills the viewport — content may overflow on one axis,
                // which is preferable to letterboxing for a full-bleed background layer.
                viewBox={`0 ${viewY} 800 ${VIEW_WINDOW_HEIGHT}`}
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full"
            >
                <defs>
                    {/*
                     * gradientUnits="userSpaceOnUse" pins the gradient to the 0–4000 SVG
                     * coordinate range, so as the viewBox shifts with scroll the correct
                     * terrain color is always visible (green at summit, blue at valley).
                     */}
                    <linearGradient
                        id="topoTerrainGradient"
                        gradientUnits="userSpaceOnUse"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={TRAIL_PATH_MAX_Y}
                    >
                        <stop offset="0%" stopColor="#d4e6d4" />
                        <stop offset="25%" stopColor="#e8e0c8" />
                        <stop offset="50%" stopColor="#d4d8e0" />
                        <stop offset="75%" stopColor="#b8c8d8" />
                        <stop offset="100%" stopColor="#a0b4c8" />
                    </linearGradient>
                </defs>

                {/*
                 * Background rect extends above and below the trail range so the gradient
                 * fills every possible viewBox position (spreadMethod="pad" handles the
                 * overshoot by repeating the first/last stop colors).
                 */}
                <rect
                    x="-100"
                    y={-HALF_VIEW}
                    width="1000"
                    height={TRAIL_PATH_MAX_Y + VIEW_WINDOW_HEIGHT}
                    fill="url(#topoTerrainGradient)"
                />

                {TOPO_PATHS.map((path, i) => (
                    <path
                        key={i}
                        d={path.d}
                        fill="none"
                        stroke="var(--color-topo-line)"
                        strokeWidth="1"
                        strokeOpacity={path.strokeOpacity}
                    />
                ))}
            </svg>
        </div>
    )
}
