import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/core/ui/cn";
import type { ThemePreference } from "@/core/theme/useThemePreference";
import BrandMark from "./BrandMark";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Process", href: "#how-it-works" },
  { label: "Centres", href: "#centres" },
] as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222.2,47.4%,8%)]";

const PRIMARY_BUTTON = cn(
  "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground",
  "transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]",
  FOCUS_RING,
);

interface SiteNavProps {
  theme: ThemePreference;
  onToggleTheme: () => void;
}

const SiteNav = ({ theme, onToggleTheme }: SiteNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const closeMenu = useCallback((returnFocus: boolean) => {
    setIsMenuOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // While the sheet is open: focus its first link, lock page scroll, close on Escape
  // or when the window grows past the phone layout.
  useEffect(() => {
    if (!isMenuOpen) return;

    firstLinkRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [isMenuOpen, closeMenu]);

  return (
    <header className="dark sticky top-0 z-50 border-b border-white/10 bg-[hsl(222.2,47.4%,8%)]">
      <a
        href="#main-content"
        className={cn(
          "absolute left-4 top-3 z-[60] -translate-y-20 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[hsl(222.2,47.4%,8%)] focus:translate-y-0",
          FOCUS_RING,
        )}
      >
        Skip to content
      </a>

      <div className="container relative flex h-16 items-center justify-between gap-6">
        <Link to="/" aria-label="Fasiti home" className={cn("rounded-md", FOCUS_RING)}>
          <BrandMark tone="light" />
        </Link>

        {/* Words in the middle (desktop) */}
        <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
          <ul className="flex items-center gap-9">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className={cn(
                    "group relative whitespace-nowrap rounded-sm py-2 text-[15px] font-medium text-white/70 transition-colors duration-200 hover:text-white",
                    FOCUS_RING,
                  )}
                >
                  {label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brand-orange transition-transform duration-300 group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-5">
          <Link
            to="/signin"
            className={cn(
              "hidden whitespace-nowrap rounded-md px-1 py-2 text-[15px] font-medium text-white/80 transition-colors duration-200 hover:text-white sm:inline-block",
              FOCUS_RING,
            )}
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl text-white/80 transition-colors duration-200 hover:bg-white/5 hover:text-white",
              FOCUS_RING,
            )}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>
          <Link to="/signup" className={PRIMARY_BUTTON}>
            Get started
          </Link>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => (isMenuOpen ? closeMenu(true) : setIsMenuOpen(true))}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/5 lg:hidden",
              FOCUS_RING,
            )}
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Full-screen sheet (phones and tablets): any tap on a row closes it */}
      <div
        id={menuId}
        hidden={!isMenuOpen}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-white/10 bg-[hsl(222.2,47.4%,8%)] lg:hidden"
      >
        <nav aria-label="Menu" className="container py-4">
          <ul>
            {NAV_LINKS.map(({ label, href }, i) => (
              <li key={href} className="border-b border-white/10">
                <a
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={href}
                  onClick={() => closeMenu(false)}
                  className={cn(
                    "flex h-14 items-center text-lg font-medium text-white transition-colors hover:text-brand-text",
                    FOCUS_RING,
                  )}
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="border-b border-white/10">
              <Link
                to="/signin"
                onClick={() => closeMenu(false)}
                className={cn(
                  "flex h-14 items-center text-lg font-medium text-white/80 transition-colors hover:text-white",
                  FOCUS_RING,
                )}
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default SiteNav;
