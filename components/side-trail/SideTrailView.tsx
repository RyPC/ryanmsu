"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTrailStore } from "@/store/trailStore";
import { sideTrails } from "@/data/sideTrails";
import { SideTrailContent } from "./SideTrailContent";

const MODAL_ABOVE_OFFSET = 24; // gap between branch point and modal bottom
const EDGE_PADDING = 40; // min gap from viewport left/right edges

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.88,
        y: 28,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.55,
            delay: 3.6,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    },
    gone: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: {
            duration: 0.3,
            ease: [0.55, 0, 0.78, 0] as [number, number, number, number],
        },
    },
};

function useViewportSize() {
    const [size, setSize] = useState(() =>
        typeof window !== "undefined"
            ? {
                  width: document.documentElement.clientWidth,
                  height: window.innerHeight,
              }
            : { width: 1200, height: 800 },
    );
    useEffect(() => {
        const update = () =>
            setSize({
                width: document.documentElement.clientWidth,
                height: window.innerHeight,
            });
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    return size;
}

export function SideTrailView() {
    const { width: vw } = useViewportSize();
    const activeSideTrailId = useTrailStore((s) => s.activeSideTrailId);
    const setActiveSideTrail = useTrailStore((s) => s.setActiveSideTrail);
    const branchEndScreenPosition = useTrailStore(
        (s) => s.branchEndScreenPosition,
    );

    if (!activeSideTrailId) return null;

    const content = sideTrails[activeSideTrailId];
    if (!content) return null;

    const hasPosition = branchEndScreenPosition != null;

    // Clamp horizontal position so modal has padding from left/right edges.
    // Use full modalWidth for right-edge clamp (not halfW): actual rendered
    // position can extend right of our computed center (transform/layout mismatch).
    const modalWidth = Math.min(vw * 0.95, 840);
    const halfW = modalWidth / 2;
    const maxCenterX = vw - modalWidth - EDGE_PADDING;
    const centerX = hasPosition
        ? Math.max(
              halfW + EDGE_PADDING,
              Math.min(branchEndScreenPosition.x, maxCenterX),
          )
        : undefined;

    return (
        <div className="fixed inset-0 pointer-events-none">
            {/* Clickable backdrop - light dim to focus attention on modal */}
            <button
                onClick={() => setActiveSideTrail(null)}
                className="absolute inset-0 bg-black/20 pointer-events-auto cursor-default"
                aria-label="Close modal"
            />

            {/* Info modal - positioned above the branch point where the pin lands */}
            <motion.div
                className="pointer-events-auto absolute z-30 max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
                style={{
                    width: hasPosition ? modalWidth : undefined,
                    transformOrigin: "50% 100%",
                    ...(hasPosition
                        ? {
                              left: centerX,
                              top:
                                  branchEndScreenPosition.y -
                                  MODAL_ABOVE_OFFSET,
                              transform: "translate(-50%, -100%)",
                          }
                        : {
                              left: "50%",
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "min(95vw, 840px)",
                          }),
                }}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="gone"
            >
                <div
                    className="max-h-[min(90vh,1000px)] overflow-y-auto bg-white/98 backdrop-blur-md p-6 border border-white/80"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {content.title}
                    </h2>
                    <SideTrailContent content={content} />

                    <motion.button
                        onClick={() => setActiveSideTrail(null)}
                        className="mt-6 w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Return to trail
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
