"use client";

import {
    useRef,
    useEffect,
    useState,
    useCallback,
    type KeyboardEvent,
} from "react";
import {
    motion,
    useSpring,
    useMotionValue,
    useMotionValueEvent,
    animate,
} from "framer-motion";
import { type Checkpoint } from "@/data/experiences";
import { getTrailXAtProgress, locationToScrollProgress } from "@/lib/trailPath";
import { useTrailStore } from "@/store/trailStore";

const MAIN_PATH =
    "M 400 0 C 400 0 520 400 380 800 C 280 1200 400 1600 280 2000 C 400 2400 520 2800 400 3200 C 280 3600 400 4000 400 4000";

interface TrailLayerProps {
    progress: number;
    /** 0 when at hero, 1 when scrolled past. Used to hide trail on starter screen. */
    heroReveal: number;
    isSideTrailMode: boolean;
    sideTrailCheckpoints: Checkpoint[];
    heroHeight: number;
    trailProgressHeight: number;
    onOpenSideTrail: (checkpoint: Checkpoint) => void;
}

const BRANCH_VERTICAL_DISTANCE = 83;
const BRANCH_ANIMATION_DURATION = 0.5;
const BRANCH_ANIMATION_DELAY = 0.3;
const PIN_TRAVEL_DURATION_BASE = 1.6;
const PIN_TRAVEL_DELAY = 0.6; // After branch starts drawing
const BRANCH_DEFAULT_X_OFFSET = 620;
const BRANCH_DEFAULT_Y_OFFSET = BRANCH_VERTICAL_DISTANCE;
/** Clamp branchLength so endpoints stay on-screen and animations stay reasonable */
const BRANCH_LENGTH_MIN = 0.5;
const BRANCH_LENGTH_MAX = 2.0;

/** Height of the visible trail "window" in SVG units. Pin stays centered in this viewport. */
const VIEW_WINDOW_HEIGHT = 1400;
const TRAIL_PATH_MIN_Y = 0;
const TRAIL_PATH_MAX_Y = 4000;
const HALF_VIEW_WINDOW_HEIGHT = VIEW_WINDOW_HEIGHT / 2;

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

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
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
    sideTrailCheckpoints,
    heroHeight,
    trailProgressHeight,
    onOpenSideTrail,
}: TrailLayerProps) {
    const pathRef = useRef<SVGPathElement>(null);
    const branchPathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const branchProgress = useTrailStore((s) => s.branchProgress);
    const clickedSide = useTrailStore((s) => s.clickedSide);
    const selectedEndpoint = useTrailStore((s) => s.selectedEndpoint);
    const activeBranchLength = useTrailStore((s) => s.activeBranchLength);
    const setBranchEndScreenPosition = useTrailStore(
        (s) => s.setBranchEndScreenPosition,
    );
    const clampedBranchLength = Math.max(
        BRANCH_LENGTH_MIN,
        Math.min(BRANCH_LENGTH_MAX, activeBranchLength),
    );
    const pinTravelDuration = PIN_TRAVEL_DURATION_BASE * clampedBranchLength;
    const [markerPoint, setMarkerPoint] = useState({ x: 200, y: 0 });
    const [branchPath, setBranchPath] = useState("");
    const [pinPosition, setPinPosition] = useState({ x: 200, y: 0 });
    const [pinAngle, setPinAngle] = useState(0);
    const pinBranchProgress = useSpring(0, { stiffness: 120, damping: 30 });
    const prevProgressRef = useRef(progress);

    // Tracks the progress value used to position the marker on the main trail.
    // Animates toward branchProgress when a side trail opens so the marker visibly
    // travels to the branch point instead of teleporting.
    const displayedMarkerProgress = useMotionValue(progress);
    // True once the travel animation has completed and the pin can take over.
    const [markerHasArrived, setMarkerHasArrived] = useState(false);

    const minViewY = TRAIL_PATH_MIN_Y - HALF_VIEW_WINDOW_HEIGHT;
    const maxViewY = TRAIL_PATH_MAX_Y - HALF_VIEW_WINDOW_HEIGHT;
    const targetViewY = clamp(
        markerPoint.y - HALF_VIEW_WINDOW_HEIGHT,
        minViewY,
        maxViewY,
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

    // Compute branch path geometry from the fixed branch attachment point.
    // This is independent of the animated marker travel.
    useEffect(() => {
        const path = pathRef.current;
        if (isSideTrailMode && branchProgress != null && clickedSide && path) {
            const totalLength = path.getTotalLength();
            const point = path.getPointAtLength(branchProgress * totalLength);

            const toLeft = clickedSide === "left";
            const sign = toLeft ? -1 : 1;
            const baseXOffset =
                selectedEndpoint?.xOffset ?? BRANCH_DEFAULT_X_OFFSET;
            const baseYOffset =
                selectedEndpoint?.yOffset ?? BRANCH_DEFAULT_Y_OFFSET;
            const xOffset = baseXOffset * clampedBranchLength;
            const yOffset = baseYOffset * clampedBranchLength;
            const endX = clamp(point.x + sign * xOffset, 16, 784);
            const endY = clamp(
                point.y + yOffset,
                TRAIL_PATH_MIN_Y,
                TRAIL_PATH_MAX_Y,
            );
            const deltaX = endX - point.x;
            const deltaY = endY - point.y;

            // Path with two smooth curves reaching the endpoint
            const midX = point.x + deltaX * 0.5;
            const midY = point.y + Math.max(deltaY * 0.44, 24);
            setBranchPath(
                `M ${point.x} ${point.y} C ${point.x + deltaX * 0.14} ${point.y + Math.max(deltaY * 0.06, 6)}, ${point.x + deltaX * 0.36} ${point.y + Math.max(deltaY * 0.26, 16)}, ${midX} ${midY} C ${point.x + deltaX * 0.64} ${point.y + Math.max(deltaY * 0.62, 34)}, ${point.x + deltaX * 0.88} ${point.y + Math.max(deltaY * 0.86, 50)}, ${endX} ${endY}`,
            );
        } else {
            setBranchPath("");
            pinBranchProgress.set(0);
        }
    }, [
        isSideTrailMode,
        branchProgress,
        clickedSide,
        selectedEndpoint,
        clampedBranchLength,
        pinBranchProgress,
    ]);

    // When a side trail opens, animate the marker from its current scroll position
    // to the branch attachment point so it visibly travels there.
    // When the trail closes, sync immediately back to scroll progress.
    useEffect(() => {
        if (isSideTrailMode && branchProgress != null) {
            setMarkerHasArrived(false);
            const controls = animate(displayedMarkerProgress, branchProgress, {
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
                onComplete: () => setMarkerHasArrived(true),
            });
            return () => controls.stop();
        } else {
            setMarkerHasArrived(false);
        }
    }, [isSideTrailMode, branchProgress, displayedMarkerProgress]);

    // Keep displayedMarkerProgress in sync with scroll when not in side trail mode.
    useEffect(() => {
        if (!isSideTrailMode) {
            displayedMarkerProgress.set(progress);
        }
    }, [progress, isSideTrailMode, displayedMarkerProgress]);

    // Drive markerPoint and pinAngle from the animated progress value.
    useMotionValueEvent(displayedMarkerProgress, "change", (latest) => {
        const path = pathRef.current;
        if (!path) return;
        const totalLength = path.getTotalLength();
        const point = path.getPointAtLength(latest * totalLength);
        setMarkerPoint({ x: point.x, y: point.y });
        const scrollForward = latest >= prevProgressRef.current;
        prevProgressRef.current = latest;
        const angle = getTangentAngle(path, latest, scrollForward);
        setPinAngle(angle);
    });

    // Animate pin along the branch once path is drawn
    useEffect(() => {
        if (isSideTrailMode && branchPath) {
            const controls = animate(pinBranchProgress, 1, {
                duration: pinTravelDuration,
                delay: PIN_TRAVEL_DELAY,
                ease: [0.22, 1, 0.36, 1],
            });
            return () => controls.stop();
        }
    }, [isSideTrailMode, branchPath, pinBranchProgress, pinTravelDuration]);

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

        const vbW = 800;
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

    // While the marker is traveling to the branch point, keep showing markerPoint.
    // Only switch to the branch pin once the marker has arrived.
    const displayPinPosition =
        isSideTrailMode && branchPath && markerHasArrived
            ? pinPosition
            : markerPoint;

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
                {!isSideTrailMode &&
                    sideTrailCheckpoints.map((checkpoint) => {
                        if (!checkpoint.sideTrail || !checkpoint.sideTrailId) {
                            return null;
                        }
                        const endpointSide =
                            checkpoint.sideTrailEndpoint?.side ?? "right";
                        const sideSign = endpointSide === "left" ? -1 : 1;
                        const checkpointBranchLength = Math.max(
                            BRANCH_LENGTH_MIN,
                            Math.min(
                                BRANCH_LENGTH_MAX,
                                checkpoint.branchLength ?? 1.0,
                            ),
                        );
                        const xOffset =
                            (checkpoint.sideTrailEndpoint?.xOffset ??
                                BRANCH_DEFAULT_X_OFFSET) *
                            checkpointBranchLength;
                        const yOffset =
                            (checkpoint.sideTrailEndpoint?.yOffset ??
                                BRANCH_DEFAULT_Y_OFFSET) *
                            checkpointBranchLength;

                        const branchStartProgress = locationToScrollProgress(
                            checkpoint.locationOnTrail,
                            heroHeight,
                            trailProgressHeight,
                        );
                        const path = pathRef.current;
                        const fallbackStartX =
                            getTrailXAtProgress(branchStartProgress);
                        const fallbackStartY =
                            branchStartProgress * TRAIL_PATH_MAX_Y;
                        let startX = fallbackStartX;
                        let startY = fallbackStartY;

                        if (path) {
                            const pathLength = path.getTotalLength();
                            const pathT = clamp(branchStartProgress, 0, 1);
                            const startPoint = path.getPointAtLength(
                                pathT * pathLength,
                            );
                            startX = startPoint.x;
                            startY = startPoint.y;
                        }

                        const endpointX = clamp(
                            startX + sideSign * xOffset,
                            16,
                            784,
                        );
                        const endpointY = clamp(
                            startY + yOffset,
                            TRAIL_PATH_MIN_Y,
                            TRAIL_PATH_MAX_Y,
                        );
                        if (
                            endpointY < viewY - 120 ||
                            endpointY > viewY + VIEW_WINDOW_HEIGHT + 120
                        ) {
                            return null;
                        }

                        const label =
                            checkpoint.sideTrailEndpoint?.label ??
                            checkpoint.title;
                        const labelWidth = clamp(
                            56 + label.length * 5.2,
                            88,
                            190,
                        );
                        const labelHeight = 24;
                        const labelX =
                            endpointSide === "left"
                                ? endpointX - labelWidth - 12
                                : endpointX + 12;
                        const labelY = endpointY - labelHeight / 2;

                        const onKeyDown = (
                            event: KeyboardEvent<SVGGElement>,
                        ) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onOpenSideTrail(checkpoint);
                            }
                        };

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
                                <circle
                                    cx={endpointX}
                                    cy={endpointY}
                                    r={7}
                                    fill="#7c3aed"
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                />
                                <circle
                                    cx={endpointX}
                                    cy={endpointY}
                                    r={11}
                                    fill="none"
                                    stroke="#8b5cf6"
                                    strokeOpacity={0.6}
                                />
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
                                    y={endpointY + 4}
                                    textAnchor="middle"
                                    className="select-none fill-violet-900 text-[10px] font-medium"
                                >
                                    {label}
                                </text>
                            </g>
                        );
                    })}
            </motion.svg>
        </div>
    );
}
