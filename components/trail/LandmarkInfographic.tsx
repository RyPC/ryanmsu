"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Checkpoint } from "@/data/experiences";

interface LandmarkInfographicProps {
    checkpoint: Checkpoint | null;
    isVisible: boolean;
}

const infographicVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        y: 10,
        transition: {
            duration: 0.25,
            ease: "easeInOut",
        },
    },
};

export function LandmarkInfographic({
    checkpoint,
    isVisible,
}: LandmarkInfographicProps) {
    const baseClasses =
        "pointer-events-none fixed z-[60] flex max-w-sm flex-col gap-4 rounded-2xl border border-orange-200/80 bg-white/95 p-5 shadow-2xl shadow-orange-100/80 backdrop-blur-md";

    const getLayoutClasses = (id: string | undefined) => {
        if (id === "about-me") {
            return "right-6 top-24 md:right-10 md:top-28 lg:right-16 lg:top-32";
        }
        if (id === "uc-irvine") {
            return "left-6 bottom-24 md:left-10 md:bottom-28 lg:left-16 lg:bottom-32";
        }
        return "right-6 top-24 md:right-10 md:top-28 lg:right-16 lg:top-32";
    };

    return (
        <AnimatePresence>
            {isVisible && checkpoint && (
                <motion.div
                    className={`${baseClasses} ${getLayoutClasses(checkpoint.id)}`}
                    variants={infographicVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                            <span className="text-lg" aria-hidden="true">
                                ◆
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                                Landmark
                            </p>
                            <h3 className="truncate text-base font-semibold text-gray-900">
                                {checkpoint.title}
                            </h3>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">
                        {checkpoint.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-orange-50 px-3 py-2">
                            <p className="font-medium text-orange-900">
                                Trail Role
                            </p>
                            <p className="mt-0.5 text-[11px] text-orange-800/80">
                                Personal snapshot on the main ridge of the
                                trail.
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2">
                            <p className="font-medium text-slate-900">
                                Vibe Check
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-700/80">
                                Builder, teammate, and outdoors person — all in
                                one backpack.
                            </p>
                        </div>
                        <div className="rounded-xl bg-violet-50 px-3 py-2">
                            <p className="font-medium text-violet-900">
                                Focus
                            </p>
                            <p className="mt-0.5 text-[11px] text-violet-800/80">
                                Systems that feel intentional and earn trust via
                                details.
                            </p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 px-3 py-2">
                            <p className="font-medium text-emerald-900">
                                Off-Trail
                            </p>
                            <p className="mt-0.5 text-[11px] text-emerald-800/80">
                                Skiing, climbing, and long days outside with
                                friends.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

