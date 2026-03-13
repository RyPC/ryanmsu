"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useSpring, useMotionValueEvent, animate } from "framer-motion";
import { useTrailStore } from "@/store/trailStore";

const MAIN_PATH =
    "M 200 0 C 200 0 320 400 180 800 C 80 1200 200 1600 80 2000 C 200 2400 320 2800 200 3200 C 80 3600 200 4000 200 4000";

interface TrailLayerProps {
    progress: number;
    /** 0 when at hero, 1 when scrolled past. Used to hide trail on starter screen. */
    heroReveal: number;
    isSideTrailMode: boolean;
}

const BRANCH_VERTICAL_DISTANCE = 83; // ~50% longer — trail winds out to the side
const BRANCH_ANIMATION_DURATION = 6;
const BRANCH_ANIMATION_DELAY = 0.3;
const PIN_TRAVEL_DURATION = 2.5;
const PIN_TRAVEL_DELAY = 1; // After branch starts drawing

/** Height of the visible trail "window" in SVG units. Pin stays centered in this viewport. */
const VIEW_WINDOW_HEIGHT = 1400;

/** Marker: circle (you) + arrow (direction). Arrow extends from top of circle. */
const MARKER_CIRCLE_R = 13;
const ARROW_TIP_Y = -49;
const ARROW_BASE_Y = -13;
const ARROW_HALF_WIDTH = 9;
const ARROW_PATH = `M 0 ${ARROW_TIP_Y} L -${ARROW_HALF_WIDTH} ${ARROW_BASE_Y} L ${ARROW_HALF_WIDTH} ${ARROW_BASE_Y} Z`;

function getPointOnPath(pathEl: SVGPathElement | null, t: number) {
    if (!pathEl) return null;
    const len = pathEl.getTotalLength();
    const pt = pathEl.getPointAtLength(t * len);
    return { x: pt.x, y: pt.y };
}

/** Returns angle in radians: direction of path at t. 0 = down in SVG coords; +PI = up when scrolling backward */
function getTangentAngle(
    pathEl: SVGPathElement | null,
    t: number,
    forward: boolean,
): number {
    if (!pathEl) return 0;
    const len = pathEl.getTotalLength();
    const delta = 0.01;
    const t1 = Math.max(0, t - delta);
    const t2 = Math.min(1, t + delta);
    const p1 = pathEl.getPointAtLength(t1 * len);
    const p2 = pathEl.getPointAtLength(t2 * len);
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    if (dx === 0 && dy === 0) return 0;
    let angle = Math.atan2(dx, dy);
    if (!forward) angle += Math.PI;
    return angle;
}

export function TrailLayer({
    progress,
    heroReveal,
    isSideTrailMode,
}: TrailLayerProps) {
    const pathRef = useRef<SVGPathElement>(null);
    const branchPathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const branchProgress = useTrailStore((s) => s.branchProgress);
    const clickedSide = useTrailStore((s) => s.clickedSide);
    const setBranchEndScreenPosition = useTrailStore(
        (s) => s.setBranchEndScreenPosition,
    );
    const [markerPoint, setMarkerPoint] = useState({ x: 200, y: 0 });
    const [branchPath, setBranchPath] = useState("");
    const [pinPosition, setPinPosition] = useState({ x: 200, y: 0 });
    const [pinAngle, setPinAngle] = useState(0);
    const pinBranchProgress = useSpring(0, { stiffness: 120, damping: 30 });
    const prevProgressRef = useRef(progress);

    const effectiveProgress =
        isSideTrailMode && branchProgress != null ? branchProgress : progress;

    const targetViewY = Math.max(
        0,
        Math.min(
            markerPoint.y - VIEW_WINDOW_HEIGHT / 2,
            4000 - VIEW_WINDOW_HEIGHT,
        ),
    );
    const viewYSpring = useSpring(targetViewY, {
        stiffness: 80,
        damping: 20,
        restDelta: 0.5,
    });
    const [viewY, setViewY] = useState(targetViewY);

    useEffect(() => {
        viewYSpring.set(targetViewY);
    }, [targetViewY, viewYSpring]);

    useMotionValueEvent(viewYSpring, "change", (latest) => setViewY(latest));

    useEffect(() => {
        const path = pathRef.current;
        if (!path) return;

        const totalLength = path.getTotalLength();
        const length = effectiveProgress * totalLength;
        const point = path.getPointAtLength(length);
        setMarkerPoint({ x: point.x, y: point.y });

        // Update pin angle: path tangent + scroll direction (forward = scrolling down)
        const scrollForward = progress >= prevProgressRef.current;
        prevProgressRef.current = progress;
        if (!isSideTrailMode || !branchPath) {
            const angle = getTangentAngle(
                path,
                effectiveProgress,
                scrollForward,
            );
            setPinAngle(angle);
        }

        if (isSideTrailMode && branchProgress != null && clickedSide) {
            const toLeft = clickedSide === "left";
            const sign = toLeft ? -1 : 1;
            const endX = toLeft ? 0 : 400;
            const endY = point.y + BRANCH_VERTICAL_DISTANCE;
            // Path with three gentle bends, ending in a straight segment
            const bend1x = point.x + sign * 70;
            const bend1y = point.y + 20;
            const bend2x = point.x + sign * 135;
            const bend2y = point.y + 45;
            const bend3x = point.x + sign * 195;
            const bend3y = point.y + 68;
            setBranchPath(
                `M ${point.x} ${point.y} C ${point.x + sign * 45} ${point.y + 10}, ${point.x + sign * 62} ${point.y + 15}, ${bend1x} ${bend1y} C ${point.x + sign * 55} ${point.y + 30}, ${point.x + sign * 108} ${point.y + 38}, ${bend2x} ${bend2y} C ${point.x + sign * 118} ${point.y + 55}, ${point.x + sign * 165} ${point.y + 62}, ${bend3x} ${bend3y} L ${endX} ${endY}`,
            );
        } else {
            setBranchPath("");
            pinBranchProgress.set(0);
        }
    }, [effectiveProgress, isSideTrailMode, branchProgress, clickedSide]);

    // Animate pin along the branch once path is drawn
    useEffect(() => {
        if (isSideTrailMode && branchPath) {
            const controls = animate(pinBranchProgress, 1, {
                duration: PIN_TRAVEL_DURATION,
                delay: PIN_TRAVEL_DELAY,
                ease: [0.22, 1, 0.36, 1],
            });
            return () => controls.stop();
        }
    }, [isSideTrailMode, branchPath, pinBranchProgress]);

    // Update pin position from branch progress (or use markerPoint when not on branch)
    useMotionValueEvent(pinBranchProgress, "change", (latest) => {
        const branchEl = branchPathRef.current;
        if (isSideTrailMode && branchPath && branchEl) {
            const pt = getPointOnPath(branchEl, latest);
            if (pt) setPinPosition(pt);
            const angle = getTangentAngle(branchEl, latest, true);
            setPinAngle(angle);
        } else {
            setPinPosition(markerPoint);
        }
    });

    // Fallback: when not on branch, pin follows marker
    useEffect(() => {
        if (!isSideTrailMode || !branchPath) {
            setPinPosition(markerPoint);
        }
    }, [markerPoint, isSideTrailMode, branchPath]);

    // Compute branch end position in screen coordinates for modal placement
    const updateBranchEndScreenPosition = useCallback(() => {
        if (!isSideTrailMode || !branchPath || !containerRef.current) {
            setBranchEndScreenPosition(null);
            return;
        }
        const branchEl = branchPathRef.current;
        if (!branchEl) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const endPt = getPointOnPath(branchEl, 1);
        if (!endPt) return;

        const svg = container.querySelector("svg");
        if (!svg) return;

        const vbW = 400;
        const vbH = VIEW_WINDOW_HEIGHT;
        const scale = Math.min(rect.width / vbW, rect.height / vbH);
        const contentW = vbW * scale;
        const contentH = vbH * scale;
        const offsetX = (rect.width - contentW) / 2;
        const offsetY = (rect.height - contentH) / 2;

        const x = rect.left + offsetX + (endPt.x / vbW) * contentW;
        const y = rect.top + offsetY + ((endPt.y - viewY) / vbH) * contentH;

        setBranchEndScreenPosition({ x, y });
    }, [isSideTrailMode, branchPath, viewY]);

    useEffect(() => {
        updateBranchEndScreenPosition();
        const id = setTimeout(updateBranchEndScreenPosition, 100);
        const ro = new ResizeObserver(updateBranchEndScreenPosition);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => {
            clearTimeout(id);
            ro.disconnect();
        };
    }, [updateBranchEndScreenPosition]);

    const trailOpacity = isSideTrailMode ? 1 : heroReveal;

    const displayPinPosition =
        isSideTrailMode && branchPath ? pinPosition : markerPoint;

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
                viewBox={`0 ${viewY} 400 ${VIEW_WINDOW_HEIGHT}`}
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
                        strokeDasharray="900"
                        initial={{ strokeDashoffset: 900 }}
                        animate={{ strokeDashoffset: 0 }}
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
                    {/* Radar ping ring */}
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
                    {/* "You" circle */}
                    <circle
                        cx={0}
                        cy={0}
                        r={MARKER_CIRCLE_R}
                        fill="#7c3aed"
                        stroke="#fff"
                        strokeWidth="2"
                    />
                    {/* Direction arrow */}
                    <path
                        d={ARROW_PATH}
                        fill="url(#markerGradient)"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                </motion.g>
            </motion.svg>
        </div>
    );
}
