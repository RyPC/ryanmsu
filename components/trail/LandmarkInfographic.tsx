"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Checkpoint } from "@/data/experiences";

interface LandmarkInfographicProps {
    checkpoint: Checkpoint | null;
    isVisible: boolean;
}

interface LandmarkTile {
    label: string;
    value: string;
    color: "orange" | "slate" | "violet" | "emerald" | "sky" | "rose";
}

const tileColors: Record<LandmarkTile["color"], { bg: string; label: string; value: string }> = {
    orange:  { bg: "bg-orange-50",  label: "text-orange-900",  value: "text-orange-800/80" },
    slate:   { bg: "bg-slate-50",   label: "text-slate-900",   value: "text-slate-700/80"  },
    violet:  { bg: "bg-violet-50",  label: "text-violet-900",  value: "text-violet-800/80" },
    emerald: { bg: "bg-emerald-50", label: "text-emerald-900", value: "text-emerald-800/80"},
    sky:     { bg: "bg-sky-50",     label: "text-sky-900",     value: "text-sky-800/80"    },
    rose:    { bg: "bg-rose-50",    label: "text-rose-900",    value: "text-rose-800/80"   },
};

const LANDMARK_TILES: Record<string, LandmarkTile[]> = {
    "about-me": [
        { label: "Next Role",     value: "Incoming SWE @ BlackRock · Starting 2026",                      color: "sky"     },
        { label: "Experience",    value: "Veeva Systems · GoWith (co-founder) · 2 research roles",        color: "slate"   },
        { label: "Stack",         value: "Java · React · Python · TypeScript · AWS · PostgreSQL",         color: "violet"  },
        { label: "Outside Code",  value: "Skiing, climbing, long hikes — best ideas come on the way down", color: "emerald" },
    ],
    "uc-irvine": [
        { label: "Degree",      value: "B.S. Computer Science",                                    color: "orange"  },
        { label: "GPA",         value: "3.92 / 4.0",                                                color: "emerald" },
        { label: "Graduated",   value: "March 2026",                                               color: "slate"   },
        { label: "Involvement", value: "IVP of Commit the Change · Research Assistant in Anthropology", color: "violet"  },
    ],
};

const infographicVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        y: 10,
        transition: { duration: 0.25, ease: "easeInOut" },
    },
};

export function LandmarkInfographic({
    checkpoint,
    isVisible,
}: LandmarkInfographicProps) {
    const baseClasses =
        "pointer-events-none fixed z-[60] flex w-[576px] max-w-[calc(100vw-3rem)] flex-col gap-6 rounded-2xl border border-orange-200/80 bg-white/95 p-8 shadow-2xl shadow-orange-100/80 backdrop-blur-md";

    const getLayoutClasses = (id: string | undefined) => {
        if (id === "about-me") return "right-6 top-24 md:right-10 md:top-28 lg:right-16 lg:top-32";
        if (id === "uc-irvine") return "left-6 bottom-24 md:left-10 md:bottom-28 lg:left-16 lg:bottom-32";
        return "right-6 top-24 md:right-10 md:top-28 lg:right-16 lg:top-32";
    };

    const tiles = checkpoint ? (LANDMARK_TILES[checkpoint.id] ?? []) : [];

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
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                            <span className="text-2xl" aria-hidden="true">◆</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
                                Landmark
                            </p>
                            <h3 className="truncate text-xl font-semibold text-gray-900">
                                {checkpoint.title}
                            </h3>
                        </div>
                    </div>

                    {checkpoint.links && checkpoint.links.length > 0 && (
                        <div className="flex gap-2">
                            {checkpoint.links.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pointer-events-auto flex items-center gap-1.5 rounded-md border border-orange-200/60 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-900 transition-colors hover:bg-orange-100"
                                >
                                    {link.label === "GitHub" && (
                                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                        </svg>
                                    )}
                                    {link.label === "LinkedIn" && (
                                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    )}
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {tiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {tiles.map((tile, i) => {
                                const c = tileColors[tile.color];
                                const isOddLast = tiles.length % 2 !== 0 && i === tiles.length - 1;
                                return (
                                    <div
                                        key={tile.label}
                                        className={`rounded-xl px-4 py-3 ${c.bg} ${isOddLast ? "col-span-2" : ""}`}
                                    >
                                        <p className={`font-medium ${c.label}`}>{tile.label}</p>
                                        <p className={`mt-1 text-xs ${c.value}`}>{tile.value}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
