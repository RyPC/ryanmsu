"use client";

import { motion, type Variants } from "framer-motion";
import type { Checkpoint as CheckpointType } from "@/data/experiences";
import { TRAIL_CONTENT_HEIGHT } from "@/lib/trailPath";

const TRAIL_ZONE_LEFT_PCT = 30;
const TRAIL_ZONE_RIGHT_PCT = 70;
const CARD_TRAIL_GAP = 24;

interface CheckpointProps {
    checkpoint: CheckpointType;
    index: number;
    heroHeight: number;
    isInViewport: boolean;
    isVisible: boolean;
    onOpenSideTrail: (checkpoint: CheckpointType) => void;
    exitVariants?: Variants;
}

const variantStyles = {
    experience: {
        badge: "bg-violet-100 text-violet-800",
        icon: "text-violet-600",
        border: "border-violet-200/60",
        techBg: "bg-violet-100 text-violet-800",
        button: "bg-violet-600 hover:bg-violet-700 text-white",
        buttonText: "Take Side Trail",
    },
    project: {
        badge: "bg-orange-100 text-orange-800",
        icon: "text-orange-600",
        border: "border-orange-200/60",
        techBg: "bg-orange-100 text-orange-800",
        button: "bg-orange-500 hover:bg-orange-600 text-white",
        buttonText: "Explore",
    },
    education: {
        badge: "bg-amber-100 text-amber-800",
        icon: "text-amber-600",
        border: "border-amber-200/60",
        techBg: "bg-amber-100 text-amber-800",
        button: "",
        buttonText: "",
    },
};

const landmarkStyles = {
    badge: "bg-orange-100 text-orange-900",
    icon: "text-orange-600",
    border: "border-orange-400/70",
    techBg: "bg-orange-50 text-orange-900",
    button: "",
    buttonText: "",
};

const iconPaths: Record<string, string> = {
    trailhead: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    campsite: "M3 21h18M5 21V7l7-4 7 4v14M9 10v11M15 10v11",
    peak: "M12 2L2 19h20L12 2zM12 8v6M12 14h.01",
    lab: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    computer:
        "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    startup: "M13 10V3L4 14h7v7l9-11h-7z",
};

export function Checkpoint({
    checkpoint,
    index,
    heroHeight,
    isInViewport,
    isVisible,
    onOpenSideTrail,
    exitVariants,
}: CheckpointProps) {
    const sideOffset = index % 2 === 0 ? "left" : "right";
    const isLandmark = checkpoint.isLandmark ?? false;
    const isEducation = !isLandmark && checkpoint.variant === "education";
    const styles = isLandmark
        ? landmarkStyles
        : variantStyles[checkpoint.variant];

    const positionStyle =
        sideOffset === "left"
            ? {
                  right: `calc(${100 - TRAIL_ZONE_LEFT_PCT}% + ${CARD_TRAIL_GAP}px)`,
              }
            : { left: `calc(${TRAIL_ZONE_RIGHT_PCT}% + ${CARD_TRAIL_GAP}px)` };

    const cardWidth = isLandmark
        ? "w-[26rem] max-w-[calc(100vw-2rem)]"
        : isEducation
          ? "w-96 max-w-[calc(100vw-2rem)]"
          : "w-72 max-w-[calc(100vw-2rem)]";

    return (
        <motion.div
            variants={exitVariants}
            className={`absolute z-10 ${cardWidth}`}
            style={{
                top: `${checkpoint.locationOnTrail * TRAIL_CONTENT_HEIGHT + heroHeight / 2}px`,
                transform: "translateY(-50%)",
                pointerEvents: isLandmark
                    ? isVisible
                        ? undefined
                        : "none"
                    : isInViewport
                      ? undefined
                      : "none",
                ...positionStyle,
            }}
            initial={isLandmark ? false : { opacity: 0, y: 20, scale: 0.95 }}
            animate={
                isLandmark
                    ? { opacity: isVisible ? 1 : 0, y: 0, scale: 1 }
                    : isVisible
                      ? { opacity: 1, y: 0, scale: 1 }
                      : isInViewport
                        ? { opacity: 0.3, y: 10, scale: 0.98 }
                        : { opacity: 0, y: 20, scale: 0.95 }
            }
            transition={
                isLandmark
                    ? { duration: 0.25, ease: "easeInOut" }
                    : { duration: 0.4, ease: "easeOut" }
            }
        >
            <div
                className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border transition-all duration-200 cursor-default ${styles.border} ${
                    isLandmark
                        ? "p-6 shadow-orange-200/60 hover:shadow-orange-300/60 hover:shadow-xl"
                        : isEducation
                          ? "p-6 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]"
                          : "p-4 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]"
                }`}
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className={styles.icon}>
                        <svg
                            className={
                                isLandmark
                                    ? "w-7 h-7"
                                    : isEducation
                                      ? "w-7 h-7"
                                      : "w-5 h-5"
                            }
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={iconPaths[checkpoint.icon] || iconPaths.peak}
                            />
                        </svg>
                    </span>
                    <span
                        className={`text-xs font-medium uppercase tracking-wider ${styles.badge} px-2 py-0.5 rounded`}
                    >
                        {isLandmark
                            ? "Landmark"
                            : checkpoint.variant === "experience"
                              ? "Side Trail"
                              : checkpoint.variant === "project"
                                ? "Checkpoint"
                                : "Education"}
                    </span>
                </div>
                <h3
                    className={`font-bold text-gray-900 mb-2 ${isLandmark ? "text-2xl" : isEducation ? "text-xl font-semibold" : "font-semibold"}`}
                >
                    {checkpoint.title}
                </h3>
                <p
                    className={`text-gray-600 mb-3 ${isLandmark ? "text-base leading-relaxed" : isEducation ? "text-base" : "text-sm"}`}
                >
                    {checkpoint.description}
                </p>
                {isLandmark && checkpoint.links && checkpoint.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {checkpoint.links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-md border border-orange-200/60 bg-orange-50/80 px-3 py-1 text-xs font-medium text-orange-900 transition-colors hover:bg-orange-100/80"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
                {checkpoint.techStack && checkpoint.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {checkpoint.techStack.slice(0, 4).map((tech) => (
                            <span
                                key={tech}
                                className={`text-xs px-2 py-0.5 rounded ${styles.techBg}`}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                )}
                {!isLandmark && checkpoint.sideTrail && styles.button && (
                    <button
                        onClick={() => onOpenSideTrail(checkpoint)}
                        className={`w-full py-2 px-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${styles.button}`}
                    >
                        {styles.buttonText}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
