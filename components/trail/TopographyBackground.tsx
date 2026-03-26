"use client";

import { TOPO_PATHS } from "@/data/topoPaths";
import {
    VIEW_WINDOW_HEIGHT,
    TRAIL_PATH_MAX_Y,
    HALF_VIEW_WINDOW_HEIGHT,
} from "@/lib/constants";

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

interface TopographyBackgroundProps {
    progress: number;
}

export function TopographyBackground({ progress }: TopographyBackgroundProps) {
    // Approximates the TrailLayer viewBox using linear progress * max-Y.
    // Small drift from the exact path geometry is acceptable for a background element.
    // Uses direct value (no spring) so it scrolls 1:1 with scroll position.
    const viewY = clamp(
        progress * TRAIL_PATH_MAX_Y - HALF_VIEW_WINDOW_HEIGHT,
        -HALF_VIEW_WINDOW_HEIGHT,
        TRAIL_PATH_MAX_Y - HALF_VIEW_WINDOW_HEIGHT,
    );

    return (
        <div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
            aria-hidden="true"
        >
            <svg
                viewBox={`0 ${viewY} 800 ${VIEW_WINDOW_HEIGHT}`}
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full"
            >
                <defs>
                    {/*
                     * gradientUnits="userSpaceOnUse" pins the gradient to the full 0–4000
                     * SVG coordinate range so the correct terrain color stays visible as
                     * the viewBox shifts with scroll.
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
                <rect
                    x="-100"
                    y={-HALF_VIEW_WINDOW_HEIGHT}
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
    );
}
