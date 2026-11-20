import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { useThemePreference } from "@/core/theme/useThemePreference";
import BrandMark from "@/components/LandingPage/BrandMark";
import { CbtDemo } from "@/components/LandingPage/FeatureDemos";
import { FOCUS_RING } from "./authUi";

/**
 * Split auth layout on the design-system tokens (`fasiti-theme`, light/dark toggle).
 * Desktop: the navy brand stage from the landing hero on the left, the form on the right.
 * Phones: a compact header with the mark, a one-line reminder of the product, and the form.
 */

interface AuthLayoutProps {
  children: ReactNode;
}

const ThemeToggle = ({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    className={cn(
      "inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
      FOCUS_RING,
    )}
  >
    {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
  </button>
);

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { theme, toggleTheme } = useThemePreference();

  return (
    <div
      className={cn(
        "fasiti-theme grid min-h-screen bg-background text-foreground antialiased lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]",
        theme === "dark" && "dark",
      )}
    >
      {/* ── Brand stage (desktop) ── */}
      <aside className="dark relative hidden overflow-hidden border-r border-white/10 bg-[hsl(222.2,47.4%,8%)] p-12 text-white lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 45% at 60% 55%, hsl(25 95% 53% / 0.14), transparent 70%)",
          }}
        />
        <Link to="/" aria-label="Fasiti home" className="relative self-start rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <BrandMark tone="light" />
        </Link>

        <div className="relative flex flex-1 flex-col justify-center py-12">
          <p className="max-w-md text-balance font-display text-3xl font-extrabold tracking-[-0.02em]">
            Practise UTME the way you&apos;ll sit it
          </p>
          <p className="mt-3 max-w-md text-pretty text-white/70">
            Timed four-subject mocks, an AI tutor for every question you miss, and a clear next
            topic to study.
          </p>
          <div className="mt-8 max-w-md">
            <CbtDemo />
          </div>
        </div>

        <p className="relative text-sm text-white/60">
          UTME practice is live. Post-UTME and more exams are coming soon.
        </p>
      </aside>

      {/* ── Form column ── */}
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 pt-6 sm:px-10">
          <Link to="/" aria-label="Fasiti home" className={cn("rounded-md lg:invisible", FOCUS_RING)}>
            <BrandMark />
          </Link>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>
        <p className="px-6 pt-1 text-sm text-muted-foreground sm:px-10 lg:hidden">
          UTME practice with an AI tutor for every question you miss.
        </p>

        <main className="flex flex-1 justify-center px-6 pb-10 pt-8 sm:px-10 lg:items-center lg:pt-0">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
