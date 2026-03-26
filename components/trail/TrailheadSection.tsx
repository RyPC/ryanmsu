"use client";

import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.12,
        },
    },
};

const blockVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
};

export function TrailheadSection() {
    return (
        <motion.section
            id="trailhead"
            className="mx-auto max-w-3xl rounded-2xl bg-white/80 px-6 py-10 shadow-lg ring-1 ring-amber-900/5 backdrop-blur-sm md:px-10 md:py-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.35, once: true }}
        >
            {/* Block 1 — One-liner */}
            <motion.div variants={blockVariants} className="mb-8 md:mb-10">
                <div className="mb-3 text-3xl font-light leading-snug text-amber-700 md:text-[clamp(20px,2.5vw,28px)]">
                    <span className="mr-1 align-top text-amber-500">“</span>
                    <span className="text-slate-900">
                        I build software the way a good trail is built —
                        deliberate lines, solid footing, and care for the people
                        walking it.
                    </span>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-amber-900/60">
                    Trailhead · About Me
                </p>
            </motion.div>

            {/* Block 2 — Quick stats */}
            <motion.div variants={blockVariants} className="mb-8 md:mb-10">
                <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900/55">
                    Trail Register
                </h3>
                <div className="grid gap-3 md:grid-cols-5 sm:grid-cols-2">
                    {[
                        {
                            label: "Hometown",
                            value: "San Jose, CA",
                        },
                        {
                            label: "Studying",
                            value: "Computer Science, UC Irvine ’26",
                        },
                        {
                            label: "Currently",
                            value: "Irvine, CA",
                        },
                        {
                            label: "Outside of code",
                            value: "Skiing, climbing, and long hikes with friends",
                        },
                        {
                            label: "Ask me about",
                            value: "Building scrappy tools that ship real value",
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="rounded-lg border border-amber-100/40 bg-white/5 px-4 py-3 text-xs shadow-sm shadow-amber-900/5"
                            style={{
                                borderLeft: "2px solid rgba(240,168,90,0.4)",
                                background: "rgba(255,255,255,0.03)",
                            }}
                        >
                            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-900/60">
                                {item.label}
                            </div>
                            <div className="text-[13px] text-slate-100">
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Block 3 — Short bio */}
            <motion.div variants={blockVariants} className="mb-8 md:mb-10">
                <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900/55">
                    In a few sentences
                </h3>
                <p className="max-w-xl text-[15px] leading-[1.8] text-[#9a9aaa]">
                    I&apos;m a CS student at UC Irvine who fell in love with
                    programming by shipping small tools that made friends&apos;
                    lives easier. I&apos;m most at home in the space between
                    product and systems — figuring out the data model, the API
                    surface, and the tiny UX details that make a flow feel
                    trustworthy. Outside of engineering I chase snow and time
                    outdoors, which probably explains why I think about software
                    in terms of routes, risk, and how it feels to be the person
                    on the path.
                </p>
            </motion.div>

            {/* Block 4 — What's on this trail */}
            <motion.div variants={blockVariants} className="mb-8 md:mb-10">
                <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900/55">
                    What&apos;s on this trail
                </h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        {
                            label: "UC Irvine · education",
                            tone: "education",
                        },
                        {
                            label: "Veeva Systems · internship",
                            tone: "experience",
                        },
                        {
                            label: "Biorobotics Lab · research",
                            tone: "experience",
                        },
                        {
                            label: "Commit the Change · nonprofit",
                            tone: "experience",
                        },
                        {
                            label: "GoWith LLC · startup",
                            tone: "project",
                        },
                        {
                            label: "9 Projects · explore",
                            tone: "project",
                        },
                    ].map((badge) => {
                        const toneClasses =
                            badge.tone === "education"
                                ? "bg-amber-100/90 text-amber-900"
                                : badge.tone === "project"
                                  ? "bg-sky-100/90 text-sky-900"
                                  : "bg-violet-100/90 text-violet-900";
                        return (
                            <span
                                key={badge.label}
                                className={`rounded-full px-3 py-1 text-[11px] font-medium ${toneClasses}`}
                            >
                                {badge.label}
                            </span>
                        );
                    })}
                </div>
            </motion.div>

            {/* Transition element */}
            <motion.div
                variants={blockVariants}
                className="flex flex-col items-center gap-2 pt-2"
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="relative flex h-8 w-8 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60 opacity-60" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(255,255,255,0.9)]" />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-900/70">
                        Trail begins here
                    </p>
                </div>
            </motion.div>
        </motion.section>
    );
}
