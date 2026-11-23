import { Bookmark, BookText, History, LayoutDashboard, Trophy, type LucideIcon } from "lucide-react";

/** The app's navigation, shared by the desktop sidebar and the phone tab bar. */

export interface NavItem {
  label: string;
  /** Shorter label for the phone tab bar and the collapsed sidebar. */
  short: string;
  href: string;
  icon: LucideIcon;
  /** Other paths that belong to this item (e.g. the old /history URL). */
  alsoMatches?: string[];
  /** Shown but not usable yet: kept visible as a reminder, marked "Soon". */
  isComingSoon?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", short: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Test history", short: "History", href: "/test-history", icon: History, alsoMatches: ["/history"] },
  { label: "Saved questions", short: "Saved", href: "/saved-questions", icon: Bookmark },
  { label: "Resources", short: "Resources", href: "/resources", icon: BookText, isComingSoon: true },
  { label: "Leaderboard", short: "Ranks", href: "/leaderboard", icon: Trophy, isComingSoon: true },
];

export const isActive = (item: NavItem, pathname: string) =>
  [item.href, ...(item.alsoMatches ?? [])].some((path) => pathname === path || pathname.startsWith(`${path}/`));
