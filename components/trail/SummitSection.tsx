"use client";

import type { Checkpoint } from "@/data/experiences";

interface SummitSectionProps {
    summit: Checkpoint;
    summitReveal: number;
}

const peakPath = "M12 2L2 19h20L12 2zM12 8v6M12 14h.01";

const links = [
    { label: "Email", href: "mailto:ryan.parkcity@gmail.com" },
    { label: "LinkedIn", href: "https://linkedin.com/in/ryan-m-su" },
    { label: "GitHub", href: "https://github.com/RyPC" },
];

export function SummitSection({ summit, summitReveal }: SummitSectionProps) {
    const r = summitReveal;

    return (
        <section
            className="relative min-h-screen w-full flex flex-col items-center justify-center px-4"
            style={{
                backgroundColor: `rgba(250, 245, 235, ${r * 0.75})`,
                backdropFilter: `blur(${r * 16}px)`,
                WebkitBackdropFilter: `blur(${r * 16}px)`,
                maskImage: `linear-gradient(to bottom, transparent 0%, black 28%)`,
                WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 28%)`,
            }}
        >
            {/* Push content below the marker (sits at ~22% from top at summit) */}
            <div
                className="flex flex-col items-center text-center max-w-xl w-full"
                style={{ opacity: r }}
            >
                <div className="flex justify-center mb-4">
                    <span className="text-amber-600">
                        <svg
                            className="w-10 h-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d={peakPath}
                            />
                        </svg>
                    </span>
                </div>

                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600/70 mb-2">
                    Summit Reached
                </p>

                <h2 className="text-2xl md:text-3xl font-bold text-amber-900 tracking-tight mb-3">
                    {summit.title}
                </h2>

                <p className="text-base text-amber-800/70 leading-relaxed mb-8">
                    {summit.description}
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            target={
                                link.href.startsWith("mailto")
                                    ? undefined
                                    : "_blank"
                            }
                            rel={
                                link.href.startsWith("mailto")
                                    ? undefined
                                    : "noopener noreferrer"
                            }
                            className="rounded-lg border border-amber-300/60 bg-amber-50/80 px-5 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100/80"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
