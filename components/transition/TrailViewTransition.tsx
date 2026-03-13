"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrailLayer } from "@/components/trail/TrailLayer";
import { TrailheadHero } from "@/components/trail/TrailheadHero";
import { Checkpoint } from "@/components/trail/Checkpoint";
import { ProgressIndicator } from "@/components/trail/ProgressIndicator";
import { SideTrailView } from "@/components/side-trail/SideTrailView";
import { useTrailProgress } from "@/hooks/useTrailProgress";
import { useTrailStore } from "@/store/trailStore";
import { experiences } from "@/data/experiences";

const TRAIL_HEIGHT_PX = 30000;
/** Checkpoints are positioned at locationOnTrail * 4000; scroll container and layout stay the same. */
const TRAIL_CONTENT_HEIGHT = 4000;
/** Larger = slower pin movement along trail per scroll. Progress 0→1 over this many pixels. */
const TRAIL_PROGRESS_HEIGHT = 20000;

const blowOffContainer = {
    exit: {
        transition: {
            staggerChildren: 0.12,
            staggerDirection: 1,
            when: "afterChildren",
        },
    },
};

const blowOffTrailArea = {
    exit: {
        transition: {
            staggerChildren: 0.1,
            staggerDirection: 1,
        },
    },
};

const BLOW_DISTANCE = 2000; // Far enough to leave any viewport

const blowOffItem = (index: number, direction: "left" | "right") => {
    const baseX = BLOW_DISTANCE + (index % 4) * 100;
    const x = direction === "left" ? -baseX : baseX;
    return {
        exit: {
            x,
            opacity: 0,
            transition: {
                duration: 0.8 + (index % 6) * 0.12,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };
};

export function TrailViewTransition() {
    const activeSideTrailId = useTrailStore((s) => s.activeSideTrailId);
    const clickedSide = useTrailStore((s) => s.clickedSide);
    const returnScrollProgress = useTrailStore((s) => s.returnScrollProgress);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [heroHeight, setHeroHeight] = useState(
        typeof window !== "undefined" ? window.innerHeight : 800,
    );
    const [trailContentVisible, setTrailContentVisible] = useState(true);
    const hasVisitedSideTrail = useRef(false);

    const showTrailContent = !activeSideTrailId || trailContentVisible;
    const { progress, heroReveal } = useTrailProgress(scrollContainerRef, {
        heroHeight,
        trailHeight: TRAIL_PROGRESS_HEIGHT,
        containerReady: showTrailContent,
    });

    useEffect(() => {
        const update = () => setHeroHeight(window.innerHeight);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    useEffect(() => {
        if (activeSideTrailId) hasVisitedSideTrail.current = true;
        else setTrailContentVisible(true); // Reset when returning to trail
    }, [activeSideTrailId]);

    const handleTrailExitComplete = () => setTrailContentVisible(false);

    const scrollRestoreRef = useRef({ returnScrollProgress, heroHeight });
    scrollRestoreRef.current = { returnScrollProgress, heroHeight };

    const setScrollContainerRef = useCallback((el: HTMLDivElement | null) => {
        (
            scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = el;
        if (el) {
            const { returnScrollProgress: p, heroHeight: h } =
                scrollRestoreRef.current;
            if (p != null) {
                const scrollTop = p * (h + TRAIL_PROGRESS_HEIGHT);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        el.scrollTo({ top: scrollTop, behavior: "auto" });
                    });
                });
            }
        }
    }, []);

    const isSideTrailMode = !!activeSideTrailId;
    // Blow opposite to clicked side: right-click → blow left, left-click → blow right
    const blowDirection = clickedSide === "right" ? "left" : "right";

    return (
        <div
            className={`relative min-h-screen ${
                activeSideTrailId ? "overflow-visible" : "overflow-hidden"
            }`}
        >
            {/* Trail layer - fixed overlay above scroll content, pointer-events-none so checkpoints stay clickable */}
            <div className="fixed inset-0 z-20 pointer-events-none">
                <TrailLayer
                    progress={progress}
                    heroReveal={heroReveal}
                    isSideTrailMode={isSideTrailMode}
                />
            </div>

            {/* Trail content: unmounts after exit for clean return */}
            {showTrailContent && (
                <motion.div
                    key="trail-content"
                    ref={setScrollContainerRef}
                    className={`h-screen overflow-y-auto scroll-smooth relative z-10 ${
                        activeSideTrailId
                            ? "pointer-events-none overflow-x-visible"
                            : "overflow-x-hidden"
                    }`}
                    variants={blowOffContainer}
                    initial={
                        hasVisitedSideTrail.current
                            ? {
                                  opacity: 0,
                                  x: blowDirection === "left" ? -600 : 600,
                                  scale: 0.95,
                              }
                            : false
                    }
                    animate={
                        activeSideTrailId
                            ? "exit"
                            : { opacity: 1, x: 0, scale: 1 }
                    }
                    onAnimationComplete={
                        activeSideTrailId ? handleTrailExitComplete : undefined
                    }
                    style={
                        activeSideTrailId
                            ? {
                                  position: "fixed",
                                  inset: 0,
                                  zIndex: 5,
                              }
                            : undefined
                    }
                >
                    <motion.div variants={blowOffItem(0, blowDirection)}>
                        <TrailheadHero />
                    </motion.div>
                    <motion.div
                        className="relative w-full"
                        style={{ minHeight: `${TRAIL_HEIGHT_PX}px` }}
                        variants={blowOffTrailArea}
                    >
                        <div
                            className="absolute inset-0 pointer-events-none -z-10"
                            style={{
                                background: `linear-gradient(to bottom, 
                    #d4e6d4 0%, #e8e0c8 25%, #d4d8e0 50%, #b8c8d8 75%, #a0b4c8 100%)`,
                            }}
                        />
                        <ProgressIndicator progress={progress} />
                        {experiences
                            .filter((c) => c.id !== "trailhead")
                            .map((checkpoint, index) => {
                                const totalHeight = heroHeight + TRAIL_PROGRESS_HEIGHT;
                                const thresholdLow =
                                    (checkpoint.locationOnTrail *
                                        TRAIL_CONTENT_HEIGHT +
                                        0.125 * heroHeight) /
                                    totalHeight;
                                const thresholdHigh =
                                    (checkpoint.locationOnTrail *
                                        TRAIL_CONTENT_HEIGHT +
                                        0.875 * heroHeight) /
                                    totalHeight;
                                const isVisible =
                                    progress >= thresholdLow &&
                                    progress <= thresholdHigh;
                                return (
                                    <Checkpoint
                                        key={checkpoint.id}
                                        checkpoint={checkpoint}
                                        index={index}
                                        isVisible={isVisible}
                                        currentProgress={progress}
                                        exitVariants={blowOffItem(
                                            index + 1,
                                            blowDirection,
                                        )}
                                    />
                                );
                            })}
                    </motion.div>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {activeSideTrailId && (
                    <motion.div
                        key="side-trail"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            transition: {
                                duration: 0.3,
                                delay: 0.1,
                                ease: [0.22, 1, 0.36, 1],
                            },
                        }}
                        exit={{
                            opacity: 0,
                            transition: {
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                            },
                        }}
                        className="absolute inset-0 z-20"
                    >
                        <SideTrailView />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
