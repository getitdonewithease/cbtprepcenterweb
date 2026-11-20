import { cn } from "@/core/ui/cn";

/**
 * Fasiti's stand-in logo until a real one exists: the "stack" mark (three bars that
 * shorten like a score chart) beside the name set in the display face.
 *
 * To swap in a real logo later, replace the <svg> (or the whole lockup) with an <img>
 * here; the nav and footer both use this component.
 */

interface BrandMarkProps {
  /** "light" for dark grounds, "dark" for light grounds */
  tone?: "light" | "dark";
  className?: string;
}

const BrandMark = ({ tone = "dark", className }: BrandMarkProps) => (
  <span className={cn("inline-flex items-center gap-2", className)}>
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-brand-orange"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2.5" width="20" height="5.5" rx="2.75" />
      <rect x="2" y="9.25" width="14" height="5.5" rx="2.75" />
      <rect x="2" y="16" width="8" height="5.5" rx="2.75" />
    </svg>
    <span
      className={cn(
        "font-display text-xl font-semibold tracking-[-0.02em]",
        tone === "light" ? "text-white" : "text-foreground",
      )}
    >
      Fasiti
    </span>
  </span>
);

export default BrandMark;
