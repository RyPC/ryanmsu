"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { type Checkpoint } from "@/data/experiences";
import { useMarkerAnimation } from "@/hooks/useMarkerAnimation";
import { TrailEndpointDots } from "./TrailEndpointDots";
import {
    BRANCH_ANIMATION_DURATION,
    BRANCH_ANIMATION_DELAY,
    VIEW_WINDOW_HEIGHT,
} from "@/lib/constants";

const MAIN_PATH =
    "M 400 0 C 400 0 520 400 380 800 C 280 1200 400 1600 280 2000 C 400 2400 520 2800 400 3200 C 280 3600 400 4000 400 4000";

const MARKER_CIRCLE_R = 13;
const ARROW_TIP_Y = -49;
const ARROW_BASE_Y = -13;
const ARROW_HALF_WIDTH = 9;
const ARROW_PATH = `M 0 ${ARROW_TIP_Y} L -${ARROW_HALF_WIDTH} ${ARROW_BASE_Y} L ${ARROW_HALF_WIDTH} ${ARROW_BASE_Y} Z`;

interface TrailLayerProps {
    progress: number;
    heroReveal: number;
    isSideTrailMode: boolean;
    sideTrailCheckpoints: Checkpoint[];
    heroHeight: number;
    trailProgressHeight: number;
    onOpenSideTrail: (checkpoint: Checkpoint) => void;
}

export function TrailLayer({
    progress,
    heroReveal,
    isSideTrailMode,
    sideTrailCheckpoints,
    heroHeight,
    trailProgressHeight,
    onOpenSideTrail,
}: TrailLayerProps) {
    const pathRef = useRef<SVGPathElement>(null);
    const branchPathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { branchPath, pinAngle, viewY, displayPinPosition } = useMarkerAnimation({
        pathRef,
        branchPathRef,
        containerRef,
        progress,
        isSideTrailMode,
    });

    const trailOpacity = isSideTrailMode ? 1 : heroReveal;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: trailOpacity }}
        >
            {isSideTrailMode && (
                <div
                    className="absolute inset-0 opacity-50"
                    style={{
                        background: `linear-gradient(to bottom, 
              #d4e6d4 0%, #e8e0c8 25%, #d4d8e0 50%, #b8c8d8 75%, #a0b4c8 100%)`,
                    }}
                />
            )}
            <motion.svg
                viewBox={`0 ${viewY} 800 ${VIEW_WINDOW_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full"
            >
                <defs>
                    <linearGradient id="trailLayerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2d5016" />
                        <stop offset="35%" stopColor="#5a4a2a" />
                        <stop offset="70%" stopColor="#4a5568" />
                        <stop offset="100%" stopColor="#2c5282" />
                    </linearGradient>
                    <linearGradient id="trailBranchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#5a4a2a" />
                        <stop offset="50%" stopColor="#6d28d9" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient id="markerGradient" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="45%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                <path
                    ref={pathRef}
                    d={MAIN_PATH}
                    fill="none"
                    stroke="url(#trailLayerGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isSideTrailMode ? "opacity-90" : ""}
                />
                {isSideTrailMode && branchPath && (
                    <motion.path
                        ref={branchPathRef}
                        d={branchPath}
                        fill="none"
                        stroke="url(#trailBranchGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: BRANCH_ANIMATION_DURATION,
                            delay: BRANCH_ANIMATION_DELAY,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    />
                )}
                <motion.g
                    transform={`translate(${displayPinPosition.x}, ${displayPinPosition.y}) rotate(${((-pinAngle + Math.PI) * 180) / Math.PI})`}
                    style={{ willChange: "transform" }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <motion.circle
                        cx={0}
                        cy={0}
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2"
                        initial={{ r: MARKER_CIRCLE_R, opacity: 0.5 }}
                        animate={{ r: [MARKER_CIRCLE_R, 31], opacity: [0.5, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <circle cx={0} cy={0} r={MARKER_CIRCLE_R} fill="#7c3aed" stroke="#fff" strokeWidth="2" />
                    <path
                        d={ARROW_PATH}
                        fill="url(#markerGradient)"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                </motion.g>
                {!isSideTrailMode && (
                    <TrailEndpointDots
                        checkpoints={sideTrailCheckpoints}
                        pathRef={pathRef}
                        viewY={viewY}
                        heroHeight={heroHeight}
                        trailProgressHeight={trailProgressHeight}
                        onOpenSideTrail={onOpenSideTrail}
                    />
                )}
            </motion.svg>
        </div>
    );
}
