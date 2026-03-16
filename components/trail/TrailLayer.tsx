"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Checkpoint } from "@/data/experiences";
import { useMarkerAnimation } from "@/hooks/useMarkerAnimation";
import { TrailEndpointDots } from "./TrailEndpointDots";
import { LandmarkDots } from "./LandmarkDots";
import {
    BRANCH_ANIMATION_DURATION,
    BRANCH_ANIMATION_DELAY,
    VIEW_WINDOW_HEIGHT,
} from "@/lib/constants";

interface HoveredInfo {
    checkpoint: Checkpoint;
    x: number;
    y: number;
}

function TrailTooltip({ checkpoint, x, y }: HoveredInfo) {
    const isLandmark = checkpoint.isLandmark ?? false;
    const tooltipWidth = 272;
    const left =
        typeof window !== "undefined" &&
        x + tooltipWidth + 20 > window.innerWidth
            ? x - tooltipWidth - 16
            : x + 16;

    return (
        <div
            className="fixed z-[9999] pointer-events-none"
            style={{ left, top: y - 8, transform: "translateY(-100%)" }}
        >
            <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`rounded-xl shadow-xl border p-4 bg-white/96 backdrop-blur-sm ${
                    isLandmark
                        ? "border-orange-400/70 shadow-orange-100"
                        : "border-violet-200/60 shadow-violet-100"
                }`}
                style={{ width: tooltipWidth }}
            >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                        className={`text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
                            isLandmark
                                ? "bg-orange-100 text-orange-900"
                                : "bg-violet-100 text-violet-800"
                        }`}
                    >
                        {isLandmark
                            ? "Landmark"
                            : checkpoint.variant === "experience"
                              ? "Experience"
                              : "Project"}
                    </span>
                    {checkpoint.dates && (
                        <span className="text-xs text-gray-400 shrink-0">
                            {checkpoint.dates}
                        </span>
                    )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm leading-snug">
                    {checkpoint.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed line-clamp-3">
                    {checkpoint.description}
                </p>
                {checkpoint.techStack && checkpoint.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {checkpoint.techStack.slice(0, 5).map((tech) => (
                            <span
                                key={tech}
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                    isLandmark
                                        ? "bg-orange-50 text-orange-900"
                                        : "bg-violet-100 text-violet-800"
                                }`}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

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
    landmarkCheckpoints: Checkpoint[];
    heroHeight: number;
    trailProgressHeight: number;
    onOpenSideTrail: (checkpoint: Checkpoint) => void;
    onReturnComplete?: () => void;
}

export function TrailLayer({
    progress,
    heroReveal,
    isSideTrailMode,
    sideTrailCheckpoints,
    landmarkCheckpoints,
    heroHeight,
    trailProgressHeight,
    onOpenSideTrail,
    onReturnComplete,
}: TrailLayerProps) {
    const pathRef = useRef<SVGPathElement>(null);
    const branchPathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredInfo, setHoveredInfo] = useState<HoveredInfo | null>(null);

    const handleHoverCheckpoint = useCallback(
        (checkpoint: Checkpoint, pos: { x: number; y: number }) => {
            setHoveredInfo({ checkpoint, x: pos.x, y: pos.y });
        },
        [],
    );
    const handleHoverEnd = useCallback(() => setHoveredInfo(null), []);

    const markerStartProgress = heroHeight / (heroHeight + trailProgressHeight);
    const markerProgress = isSideTrailMode
        ? progress
        : Math.max(markerStartProgress, progress);

    const { branchPath, pinAngle, viewY, displayPinPosition } =
        useMarkerAnimation({
            pathRef,
            branchPathRef,
            containerRef,
            progress: markerProgress,
            isSideTrailMode,
            onReturnComplete,
        });

    const trailOpacity = isSideTrailMode ? 1 : heroReveal;
    const trailTranslateY = isSideTrailMode ? 0 : (1 - heroReveal) * heroHeight;

    return (
        <>
            <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full"
                style={{
                    opacity: trailOpacity,
                    transform: `translateY(${trailTranslateY}px)`,
                }}
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
                        <linearGradient
                            id="trailLayerGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="0%" stopColor="#2d5016" />
                            <stop offset="35%" stopColor="#5a4a2a" />
                            <stop offset="70%" stopColor="#4a5568" />
                            <stop offset="100%" stopColor="#2c5282" />
                        </linearGradient>
                        <linearGradient
                            id="trailBranchGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#5a4a2a" />
                            <stop offset="50%" stopColor="#6d28d9" />
                            <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                        <linearGradient
                            id="markerGradient"
                            x1="0"
                            y1="1"
                            x2="0"
                            y2="0"
                        >
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
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <motion.circle
                            cx={0}
                            cy={0}
                            fill="none"
                            stroke="#7c3aed"
                            strokeWidth="2"
                            initial={{ r: MARKER_CIRCLE_R, opacity: 0.5 }}
                            animate={{
                                r: [MARKER_CIRCLE_R, 31],
                                opacity: [0.5, 0],
                            }}
                            transition={{
                                duration: 2.2,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                        />
                        <circle
                            cx={0}
                            cy={0}
                            r={MARKER_CIRCLE_R}
                            fill="#7c3aed"
                            stroke="#fff"
                            strokeWidth="2"
                        />
                        <path
                            d={ARROW_PATH}
                            fill="url(#markerGradient)"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </motion.g>
                    {!isSideTrailMode && (
                        <>
                            <TrailEndpointDots
                                checkpoints={sideTrailCheckpoints}
                                pathRef={pathRef}
                                viewY={viewY}
                                heroHeight={heroHeight}
                                trailProgressHeight={trailProgressHeight}
                                onOpenSideTrail={onOpenSideTrail}
                                onHoverCheckpoint={handleHoverCheckpoint}
                                onHoverEnd={handleHoverEnd}
                            />
                            <LandmarkDots
                                checkpoints={landmarkCheckpoints}
                                progress={progress}
                                pathRef={pathRef}
                                viewY={viewY}
                                heroHeight={heroHeight}
                                trailProgressHeight={trailProgressHeight}
                                onHoverCheckpoint={handleHoverCheckpoint}
                                onHoverEnd={handleHoverEnd}
                            />
                        </>
                    )}
                </motion.svg>
            </div>
            <AnimatePresence>
                {hoveredInfo && !isSideTrailMode && (
                    <TrailTooltip
                        checkpoint={hoveredInfo.checkpoint}
                        x={hoveredInfo.x}
                        y={hoveredInfo.y}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
