"use client";

import { motion } from "framer-motion";

export function TrailheadHero() {
    return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Subtle terrain background */}
            <div
                className="absolute inset-0 pointer-events-none -z-10"
                style={{
                    background: `linear-gradient(180deg, #d4e6d4 0%, #e0e8d8 50%, #e8e0c8 100%)`,
                }}
            />

            <motion.div
                className="text-center max-w-2xl"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 tracking-tight">
                    Ryan Su
                </h1>
                <motion.p
                    className="mt-4 text-lg md:text-xl text-amber-800/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    My Engineering Trail
                </motion.p>
                <motion.p
                    className="mt-2 text-base md:text-lg text-amber-700/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                >
                    Computer Science at UC Irvine &apos;26 · Building software
                    for impact
                </motion.p>
                <motion.p
                    className="mt-6 text-sm text-amber-600/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    Scroll to follow the trail
                </motion.p>
                <motion.div
                    className="mt-8 flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="w-8 h-12 rounded-full border-2 border-amber-600/40 flex justify-center pt-2">
                        <motion.div
                            className="w-1.5 h-3 bg-amber-600/60 rounded-full"
                            animate={{ y: [0, 8, 0] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
