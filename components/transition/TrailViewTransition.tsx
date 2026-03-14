"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrailLayer } from "@/components/trail/TrailLayer";
import { TopographyBackground } from "@/components/trail/TopographyBackground";
import { TrailheadHero } from "@/components/trail/TrailheadHero";
import { Checkpoint } from "@/components/trail/Checkpoint";
import { ProgressIndicator } from "@/components/trail/ProgressIndicator";
import { SideTrailView } from "@/components/side-trail/SideTrailView";
import { SectionNav, SECTION_NAV_WIDTH } from "@/components/nav/SectionNav";
import { useTrailProgress } from "@/hooks/useTrailProgress";
import { useTrailStore } from "@/store/trailStore";
import { experiences, type Checkpoint as CheckpointType } from "@/data/experiences";
import {
    getTrailMetricsFromExperiences,
    locationToScrollProgress,
    TRAIL_CONTENT_HEIGHT,
} from "@/lib/trailPath";

/** Extra gap between nav and content so cards don't overlap */
const CONTENT_NAV_GAP = 24;
/** Trail confined to center band - width as % of content area */
const TRAIL_ZONE_WIDTH_PCT = 28;

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
    const setActiveSideTrail = useTrailStore((s) => s.setActiveSideTrail);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [heroHeight, setHeroHeight] = useState(
        typeof window !== "undefined" ? window.innerHeight : 800,
    );
    const [trailContentVisible, setTrailContentVisible] = useState(true);
    const hasVisitedSideTrail = useRef(false);
    const trailMetrics = useMemo(
        () => getTrailMetricsFromExperiences(experiences),
        [],
    );
    const { progressHeight } = trailMetrics;
    const trailScrollHeightPx = heroHeight + progressHeight;

    const showTrailContent = !activeSideTrailId || trailContentVisible;
    const { progress, heroReveal } = useTrailProgress(scrollContainerRef, {
        heroHeight,
        trailHeight: progressHeight,
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
                const scrollTop = p * (h + progressHeight);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        el.scrollTo({ top: scrollTop, behavior: "auto" });
                    });
                });
            }
        }
    }, [progressHeight]);

    const isSideTrailMode = !!activeSideTrailId;
    // Blow opposite to clicked side: right-click → blow left, left-click → blow right
    const blowDirection = clickedSide === "right" ? "left" : "right";
    const checkpointItems = experiences.filter((c) => c.id !== "trailhead");
    const sideTrailCheckpoints = checkpointItems.filter(
        (c) => c.sideTrail && c.sideTrailId,
    );

    const getCheckpointCardSide = useCallback((checkpointId: string) => {
        const checkpointIndex = checkpointItems.findIndex(
            (checkpoint) => checkpoint.id === checkpointId,
        );
        if (checkpointIndex < 0) return "right" as const;
        return checkpointIndex % 2 === 0 ? "left" : "right";
    }, [checkpointItems]);

    const handleOpenSideTrail = useCallback(
        (checkpoint: CheckpointType) => {
            if (!checkpoint.sideTrailId) return;
            const branchProgress = locationToScrollProgress(
                checkpoint.locationOnTrail,
                heroHeight,
                progressHeight,
            );
            const side =
                checkpoint.sideTrailEndpoint?.side ??
                getCheckpointCardSide(checkpoint.id);
            setActiveSideTrail(checkpoint.sideTrailId, {
                progress: branchProgress,
                side,
                checkpointId: checkpoint.id,
                endpoint: {
                    xOffset: checkpoint.sideTrailEndpoint?.xOffset,
                    yOffset: checkpoint.sideTrailEndpoint?.yOffset,
                },
            });
        },
        [getCheckpointCardSide, heroHeight, progressHeight, setActiveSideTrail],
    );

    return (
        <div
            className={`relative min-h-screen ${
                activeSideTrailId ? "overflow-visible" : "overflow-hidden"
            }`}
        >
            {/* Full-page terrain background — sits behind all other layers */}
            <TopographyBackground progress={progress} />

            {/* Section nav - fixed left, overlays scroll content; background is shared via full-width scroll */}
            <SectionNav
                scrollContainerRef={scrollContainerRef}
                progress={progress}
                heroHeight={heroHeight}
                trailProgressHeight={progressHeight}
            />

            {/* Trail layer - confined to centered band, cards go around it */}
            <div
                className="fixed top-0 right-0 bottom-0 z-20 pointer-events-none flex justify-center"
                style={{ left: SECTION_NAV_WIDTH + CONTENT_NAV_GAP }}
            >
                <div
                    className="h-full flex-shrink-0"
                    style={{ width: `${TRAIL_ZONE_WIDTH_PCT}%`, maxWidth: 560 }}
                >
                    <TrailLayer
                        progress={progress}
                        heroReveal={heroReveal}
                        isSideTrailMode={isSideTrailMode}
                        sideTrailCheckpoints={sideTrailCheckpoints}
                        heroHeight={heroHeight}
                        trailProgressHeight={progressHeight}
                        onOpenSideTrail={handleOpenSideTrail}
                    />
                </div>
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
                    style={
                        activeSideTrailId
                            ? {
                                  position: "fixed",
                                  inset: 0,
                                  zIndex: 5,
                              }
                            : undefined
                    }
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
                >
                    {/* Wrapper establishes full scroll height so background fills entire trail */}
                    <div
                        className="relative"
                        style={{
                            minHeight: `calc(100vh + ${trailScrollHeightPx}px)`,
                        }}
                    >
                        <motion.div
                            variants={blowOffItem(0, blowDirection)}
                            style={{ paddingLeft: SECTION_NAV_WIDTH + CONTENT_NAV_GAP }}
                        >
                            <TrailheadHero />
                        </motion.div>
                        <motion.div
                            className="relative w-full"
                            style={{
                                minHeight: `${trailScrollHeightPx}px`,
                                paddingLeft: SECTION_NAV_WIDTH + CONTENT_NAV_GAP,
                            }}
                            variants={blowOffTrailArea}
                        >
                        <ProgressIndicator progress={progress} />
                        {checkpointItems.map((checkpoint, index) => {
                                const totalHeight = heroHeight + progressHeight;
                                const cardY = checkpoint.locationOnTrail * TRAIL_CONTENT_HEIGHT;
                                // Card enters viewport bottom (card offset by heroHeight/2)
                                const enterThreshold = (cardY + heroHeight / 2) / totalHeight;
                                // Card is at 75% from top — visually in the lower-center
                                const revealThreshold = (cardY + heroHeight * 0.75) / totalHeight;
                                const isInViewport = progress >= enterThreshold;
                                const isVisible = progress >= revealThreshold;
                                return (
                                    <Checkpoint
                                        key={checkpoint.id}
                                        checkpoint={checkpoint}
                                        index={index}
                                        heroHeight={heroHeight}
                                        isInViewport={isInViewport}
                                        isVisible={isVisible}
                                        onOpenSideTrail={handleOpenSideTrail}
                                        exitVariants={blowOffItem(
                                            index + 1,
                                            blowDirection,
                                        )}
                                    />
                                );
                            })}
                        </motion.div>
                    </div>
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
                    className="absolute top-0 right-0 bottom-0 z-20"
                    style={{ left: SECTION_NAV_WIDTH }}
                >
                    <SideTrailView />
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
