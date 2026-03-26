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
import {
    experiences,
    type Checkpoint as CheckpointType,
} from "@/data/experiences";
import {
    getTrailMetricsFromExperiences,
    locationToScrollProgress,
    scrollProgressToMarkerProgress,
    TRAIL_CONTENT_HEIGHT,
} from "@/lib/trailPath";
import {
    LANDMARK_OPEN_THRESHOLD,
    LANDMARK_VIEWPORT_FRACTION,
} from "@/lib/constants";

const CONTENT_NAV_GAP = 24;
const TRAIL_ZONE_WIDTH_PCT = 28;
const BLOW_DISTANCE = 2000;

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
    const clearReturnScrollProgress = useTrailStore((s) => s.clearReturnScrollProgress);
    const handleReturnComplete = useCallback(
        () => setActiveSideTrail(null),
        [setActiveSideTrail],
    );
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
        else setTrailContentVisible(true);
    }, [activeSideTrailId]);

    const handleTrailExitComplete = () => setTrailContentVisible(false);

    const scrollRestoreRef = useRef({ returnScrollProgress, heroHeight });
    scrollRestoreRef.current = { returnScrollProgress, heroHeight };

    const setScrollContainerRef = useCallback(
        (el: HTMLDivElement | null) => {
            (
                scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            if (el) {
                const { returnScrollProgress: p, heroHeight: h } =
                    scrollRestoreRef.current;
                if (p != null) {
                    const scrollTop = p * (h + progressHeight);
                    // Set synchronously; direct scrollTop assignment bypasses CSS scroll-behavior.
                    el.scrollTop = scrollTop;
                    // Repeat after two rAFs in case browser layout wasn't ready on first assignment.
                    // Use direct scrollTop (not scrollTo) so scroll-smooth CSS cannot animate it.
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            el.scrollTop = scrollTop;
                            clearReturnScrollProgress();
                        });
                    });
                }
            }
        },
        [progressHeight, clearReturnScrollProgress],
    );

    const isSideTrailMode = !!activeSideTrailId;
    // Blow opposite to clicked side: right-click → blow left, left-click → blow right
    const blowDirection = clickedSide === "right" ? "left" : "right";
    const checkpointItems = experiences.filter((c) => c.id !== "trailhead");
    const sideTrailCheckpoints = checkpointItems.filter(
        (c) => c.sideTrail && c.sideTrailId,
    );
    const landmarkCheckpoints = checkpointItems.filter((c) => c.isLandmark);
    const [hoverResetToken, setHoverResetToken] = useState(0);

    // Track transitions into and out of side-trail mode so we can clear any
    // stale hover previews both when entering a side trail and after
    // returning to the main trail.
    const prevActiveSideTrailIdRef = useRef<string | null>(activeSideTrailId);
    useEffect(() => {
        const prevId = prevActiveSideTrailIdRef.current;
        if (!prevId && activeSideTrailId) {
            // Just entered a side trail from the main trail.
            setHoverResetToken((token) => token + 1);
        } else if (prevId && !activeSideTrailId) {
            // Just returned from a side trail to the main trail.
            setHoverResetToken((token) => token + 1);
        }
        prevActiveSideTrailIdRef.current = activeSideTrailId;
    }, [activeSideTrailId]);

    // Marker trail-space progress that powers marker movement and landmark
    // behavior; derived from scroll-based progress using the shared helper.
    const markerProgress = scrollProgressToMarkerProgress(
        progress,
        heroHeight,
        progressHeight,
    );

    const getCheckpointCardSide = useCallback(
        (checkpointId: string) => {
            const checkpointIndex = checkpointItems.findIndex(
                (checkpoint) => checkpoint.id === checkpointId,
            );
            if (checkpointIndex < 0) return "right" as const;
            return checkpointIndex % 2 === 0 ? "left" : "right";
        },
        [checkpointItems],
    );

    const handleOpenSideTrail = useCallback(
        (checkpoint: CheckpointType) => {
            if (!checkpoint.sideTrailId) return;
            // Use the checkpoint's canonical location along the trail as the
            // stable intersection point. We:
            // - Store branchProgress in trail-space (locationOnTrail).
            // - Compute the scroll-space progress at which the marker will sit
            //   at that trail location using the shared mapping inverse.
            const intersectionScrollProgress = locationToScrollProgress(
                checkpoint.locationOnTrail,
                heroHeight,
                progressHeight,
            );
            const side =
                checkpoint.sideTrailEndpoint?.side ??
                getCheckpointCardSide(checkpoint.id);
            setActiveSideTrail(checkpoint.sideTrailId, {
                branchProgress: checkpoint.locationOnTrail,
                returnScrollProgress: intersectionScrollProgress,
                side,
                checkpointId: checkpoint.id,
                endpoint: {
                    xOffset: checkpoint.sideTrailEndpoint?.xOffset,
                    yOffset: checkpoint.sideTrailEndpoint?.yOffset,
                },
                branchLength: checkpoint.branchLength,
            });
        },
        [
            getCheckpointCardSide,
            heroHeight,
            progressHeight,
            setActiveSideTrail,
        ],
    );

    return (
        <div
            className={`relative min-h-screen ${
                activeSideTrailId ? "overflow-visible" : "overflow-hidden"
            }`}
        >
            <TopographyBackground progress={progress} />

            <SectionNav
                scrollContainerRef={scrollContainerRef}
                progress={progress}
                heroReveal={heroReveal}
                heroHeight={heroHeight}
                trailProgressHeight={progressHeight}
            />

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
                        isSideTrailMode={isSideTrailMode}
                        sideTrailCheckpoints={sideTrailCheckpoints}
                        landmarkCheckpoints={landmarkCheckpoints}
                        heroHeight={heroHeight}
                        trailProgressHeight={progressHeight}
                        onOpenSideTrail={handleOpenSideTrail}
                        onReturnComplete={handleReturnComplete}
                        hoverResetToken={hoverResetToken}
                    />
                </div>
            </div>

            {/* Trail content unmounts after exit so scroll position restores cleanly on return */}
            {showTrailContent && (
                <motion.div
                    key="trail-content"
                    ref={setScrollContainerRef}
                    className={`h-screen overflow-y-auto relative z-10 ${
                        activeSideTrailId
                            ? "pointer-events-none overflow-x-visible"
                            : "overflow-x-hidden"
                    }`}
                    style={
                        activeSideTrailId
                            ? { position: "fixed", inset: 0, zIndex: 5 }
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
                    {/* Wrapper height ensures the background gradient fills the full trail */}
                    <div
                        className="relative"
                        style={{
                            minHeight: `calc(100vh + ${trailScrollHeightPx}px)`,
                        }}
                    >
                        <motion.div variants={blowOffItem(0, blowDirection)}>
                            <TrailheadHero />
                        </motion.div>
                        <motion.div
                            className="relative w-full"
                            style={{
                                minHeight: `${trailScrollHeightPx}px`,
                                paddingLeft:
                                    SECTION_NAV_WIDTH + CONTENT_NAV_GAP,
                            }}
                            variants={blowOffTrailArea}
                        >
                            <ProgressIndicator progress={progress} />
                            {checkpointItems
                                .filter((c) => c.isLandmark)
                                .map((checkpoint, index) => {
                                    const isLandmark =
                                        checkpoint.isLandmark ?? false;
                                    const totalScrollHeightPx =
                                        heroHeight + progressHeight;
                                    const scrollTopPx =
                                        progress * totalScrollHeightPx;
                                    const cardCenterTopPx =
                                        checkpoint.locationOnTrail *
                                            TRAIL_CONTENT_HEIGHT +
                                        heroHeight / 2;
                                    const cardCenterInViewportPx =
                                        cardCenterTopPx - scrollTopPx;

                                    const bandTopPx =
                                        (0.5 - LANDMARK_VIEWPORT_FRACTION / 2) *
                                        heroHeight;
                                    const bandBottomPx =
                                        (0.5 + LANDMARK_VIEWPORT_FRACTION / 2) *
                                        heroHeight;

                                    const isInViewportBand =
                                        cardCenterInViewportPx >= bandTopPx &&
                                        cardCenterInViewportPx <= bandBottomPx;

                                    // Landmark visibility is gated by both:
                                    // - trail-space proximity (marker vs landmark),
                                    // - card being within the middle viewport band.
                                    const isNearLandmark = isLandmark
                                        ? Math.abs(
                                              markerProgress -
                                                  checkpoint.locationOnTrail,
                                          ) < LANDMARK_OPEN_THRESHOLD
                                        : false;
                                    // For visibility, trail-space proximity is the primary gate.
                                    // The viewport band is used to keep the card roughly centered
                                    // but should not completely suppress visibility.
                                    const isLandmarkVisible = isNearLandmark;

                                    return (
                                        <Checkpoint
                                            key={checkpoint.id}
                                            checkpoint={checkpoint}
                                            index={index}
                                            heroHeight={heroHeight}
                                            isInViewport={
                                                isInViewportBand
                                            }
                                            isVisible={
                                                isLandmarkVisible
                                            }
                                            onOpenSideTrail={
                                                handleOpenSideTrail
                                            }
                                            exitVariants={blowOffItem(
                                                index + 2,
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
