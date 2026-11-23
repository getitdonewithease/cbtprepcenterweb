import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Crown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

const AppSidebar = ({ pathname, isCollapsed, onToggleCollapsed, showUpgrade, account }: AppSidebarProps) => (
  <aside
    aria-label="Sidebar"
    className={cn(
      "fasiti-theme hidden h-full shrink-0 flex-col border-r bg-card text-foreground md:flex",
      "transition-[width] duration-200 ease-soft-out motion-reduce:transition-none",
      isCollapsed ? "w-[88px]" : "w-60",
    )}
  >
    <div className={cn("flex min-h-16 shrink-0 items-center gap-1 px-3", isCollapsed ? "flex-col justify-center py-3" : "justify-between")}>
      <Link to="/dashboard" aria-label="Fasiti dashboard" className={cn("inline-flex min-h-11 items-center rounded-xl px-2", FOCUS_RING)}>
        <BrandMark className={cn(isCollapsed && "[&>span:last-child]:sr-only")} />
      </Link>
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground",
          PRESSABLE,
          FOCUS_RING,
        )}
      >
        {isCollapsed ? <PanelLeftOpen className="h-5 w-5" aria-hidden="true" /> : <PanelLeftClose className="h-5 w-5" aria-hidden="true" />}
      </button>
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

export default AppSidebar;
