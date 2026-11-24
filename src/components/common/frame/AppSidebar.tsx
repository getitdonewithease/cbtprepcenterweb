import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Crown, PanelLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE } from "@/core/ui/styles";
import BrandMark from "@/components/LandingPage/BrandMark";
import { NAV_ITEMS, isActive } from "./navItems";

/**
 * Desktop and tablet sidebar (md and up), full height, on the design-system tokens.
 * Open: icon and label in a list. Collapsed: a rail with the short label under each icon,
 * so every link stays named without a tooltip. "Soon" items are shown but not usable.
 */

interface AppSidebarProps {
  pathname: string;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  showUpgrade: boolean;
  account: ReactNode;
}

/** A small neutral tooltip naming the sidebar control (its aria-label says the same). */
const SidebarTip = ({ label, children }: { label: string; children: ReactNode }) => (
  <TooltipProvider delayDuration={400}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className="fasiti-theme rounded-lg bg-foreground font-semibold text-background">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const AppSidebar = ({ pathname, isCollapsed, onToggleCollapsed, showUpgrade, account }: AppSidebarProps) => {
  // Opening swaps the logo button for the close button (and back), so focus follows the
  // control that was used instead of falling to the page.
  const toggleRef = useRef<HTMLButtonElement>(null);
  const refocusToggle = useRef(false);
  useEffect(() => {
    if (!refocusToggle.current) return;
    refocusToggle.current = false;
    toggleRef.current?.focus();
  }, [isCollapsed]);
  const toggle = () => {
    refocusToggle.current = true;
    onToggleCollapsed();
  };

  return (
  <aside
    aria-label="Sidebar"
    className={cn(
      "fasiti-theme hidden h-full shrink-0 flex-col border-r bg-card text-foreground md:flex",
      "transition-[width] duration-200 ease-soft-out motion-reduce:transition-none",
      isCollapsed ? "w-[88px]" : "w-60",
    )}
  >
    <div className={cn("flex min-h-16 shrink-0 items-center px-3", isCollapsed ? "justify-center" : "justify-between gap-1")}>
      {isCollapsed ? (
        // Collapsed: the logo is the way back. Hover or keyboard focus turns it into the
        // sidebar icon; a click or tap opens the sidebar.
        <SidebarTip label="Open sidebar">
          <button
            type="button"
            ref={toggleRef}
            onClick={toggle}
            aria-expanded={false}
            aria-label="Open sidebar"
            className={cn("group relative inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted", PRESSABLE, FOCUS_RING)}
          >
            <BrandMark
              className={cn(
                "[&>span:last-child]:hidden transition-opacity duration-150 ease-soft-out",
                "group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none",
              )}
            />
            <PanelLeft
              className={cn(
                "absolute h-5 w-5 text-foreground opacity-0 transition-opacity duration-150 ease-soft-out",
                "group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none",
              )}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>
        </SidebarTip>
      ) : (
        <>
          <Link to="/dashboard" aria-label="Fasiti dashboard" className={cn("inline-flex min-h-11 items-center rounded-xl px-2", FOCUS_RING)}>
            <BrandMark />
          </Link>
          <SidebarTip label="Close sidebar">
            <button
              type="button"
              ref={toggleRef}
            onClick={toggle}
              aria-expanded={true}
              aria-label="Close sidebar"
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground",
                PRESSABLE,
                FOCUS_RING,
              )}
            >
              <PanelLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </SidebarTip>
        </>
      )}
    </div>

    {/* Scrolls on short screens, so the account stays reachable at the foot */}
    <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item, pathname);
          const shape = isCollapsed
            ? "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-xs font-semibold"
            : "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold";

          if (item.isComingSoon) {
            return (
              <li key={item.href}>
                <span aria-disabled="true" className={cn(shape, "cursor-default text-muted-foreground")}>
                  <Icon className="h-5 w-5 shrink-0 opacity-60" aria-hidden="true" />
                  <span className={cn(!isCollapsed && "flex-1")}>{isCollapsed ? item.short : item.label}</span>
                  {isCollapsed ? (
                    <span className="sr-only">, coming soon</span>
                  ) : (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold">
                      Soon<span className="sr-only">: not available yet</span>
                    </span>
                  )}
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                to={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  shape,
                  active ? "bg-brand-orange/10 text-brand-text" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  FOCUS_RING,
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {isCollapsed ? item.short : item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {showUpgrade && !isCollapsed && (
        <Link
          to="/upgrage"
          className={cn("mt-4 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brand-text hover:bg-brand-orange/10", FOCUS_RING)}
        >
          <Crown className="h-4 w-4" aria-hidden="true" />
          Upgrade to Premium
        </Link>
      )}
    </nav>

    <div className={cn("shrink-0 border-t p-3", isCollapsed && "flex justify-center")}>{account}</div>
  </aside>
  );
};

export default AppSidebar;
