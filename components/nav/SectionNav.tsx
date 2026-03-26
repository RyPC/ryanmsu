"use client";

import { motion } from "framer-motion";
import { experiences } from "@/data/experiences";
import { TRAIL_CONTENT_HEIGHT } from "@/lib/trailPath";
import { useTrailStore } from "@/store/trailStore";
const NAV_WIDTH = 180;

interface SectionNavProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  progress: number;
  heroReveal: number;
  heroHeight: number;
  trailProgressHeight: number;
}

function getSectionProgressBounds(
  locationOnTrail: number,
  heroHeight: number,
  trailProgressHeight: number,
): { low: number; high: number } {
  const totalHeight = heroHeight + trailProgressHeight;
  const thresholdLow =
    (locationOnTrail * TRAIL_CONTENT_HEIGHT + 0.125 * heroHeight) / totalHeight;
  const thresholdHigh =
    (locationOnTrail * TRAIL_CONTENT_HEIGHT + 0.875 * heroHeight) / totalHeight;
  return { low: thresholdLow, high: thresholdHigh };
}

function getScrollTopForSection(
  locationOnTrail: number,
  heroHeight: number,
  trailProgressHeight: number,
): number {
  const totalHeight = heroHeight + trailProgressHeight;
  const progress =
    (locationOnTrail * TRAIL_CONTENT_HEIGHT + 0.5 * heroHeight) / totalHeight;
  return Math.min(1, progress) * totalHeight;
}

export function SectionNav({
  scrollContainerRef,
  progress,
  heroReveal,
  heroHeight,
  trailProgressHeight,
}: SectionNavProps) {
  const activeSideTrailId = useTrailStore((s) => s.activeSideTrailId);
  const setActiveSideTrail = useTrailStore((s) => s.setActiveSideTrail);

  const navItems = experiences.map((exp) => ({
    id: exp.id,
    title: exp.type === "trailhead" ? "Trailhead" : exp.title,
    locationOnTrail: exp.locationOnTrail,
    isLandmark: exp.isLandmark ?? false,
  }));

  const handleClick = (locationOnTrail: number) => {
    const scrollTop =
      locationOnTrail <= 0.05
        ? 0
        : getScrollTopForSection(locationOnTrail, heroHeight, trailProgressHeight);
    const totalHeight = heroHeight + trailProgressHeight;
    const targetProgress = Math.min(1, scrollTop / totalHeight);

    if (activeSideTrailId) {
      // Close side trail and scroll to section on return
      setActiveSideTrail(null, { returnScrollProgress: targetProgress });
      return;
    }

    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: scrollTop, behavior: "smooth" });
  };

  return (
    <motion.nav
      className="fixed left-0 top-0 bottom-0 z-30 flex flex-col justify-center py-12 px-4"
      style={{ width: NAV_WIDTH }}
      animate={{ opacity: heroReveal }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const bounds =
            item.locationOnTrail <= 0.05
              ? { low: 0, high: 0.1 }
              : getSectionProgressBounds(
                  item.locationOnTrail,
                  heroHeight,
                  trailProgressHeight,
                );
          const isActive = progress >= bounds.low && progress <= bounds.high;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleClick(item.locationOnTrail)}
              className={`text-left py-1.5 px-2 rounded-md text-sm transition-colors w-full cursor-pointer border-l-2 -ml-px ${
                item.isLandmark
                  ? isActive
                    ? "border-orange-500 font-semibold"
                    : "border-transparent font-medium"
                  : isActive
                    ? "border-amber-700/70 font-medium"
                    : "border-transparent font-medium"
              }`}
              animate={{
                opacity: isActive ? 1 : 0.35,
              }}
              transition={{ duration: 0.2 }}
              whileHover={{ opacity: isActive ? 1 : 0.6 }}
            >
              <span
                className={
                  item.isLandmark
                    ? isActive
                      ? "text-orange-600"
                      : "text-orange-500/70"
                    : isActive
                      ? "text-amber-900/95"
                      : "text-amber-900/60 hover:text-amber-900/80"
                }
              >
                {item.isLandmark && (
                  <span className="mr-1 text-[10px]">◆</span>
                )}
                {item.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}

export const SECTION_NAV_WIDTH = NAV_WIDTH;
