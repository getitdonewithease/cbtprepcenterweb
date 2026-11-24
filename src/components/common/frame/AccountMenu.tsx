import { useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { setSettingsReturnFocus, settingsAddress } from "@/features/settings";
import { ChevronsUpDown, Crown, LogOut, Settings } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE } from "@/core/ui/styles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserProfile } from "@/features/dashboard";

/**
 * The account menu: Settings, upgrade (free plan) and Sign out. The trigger is a real
 * button, so the keyboard can open it (it was a div before, which locked keyboard users
 * out of signing out).
 */

interface AccountMenuProps {
  user: UserProfile | null;
  isLoading: boolean;
  hasError: boolean;
  isPaid: boolean;
  onSignOut: () => void;
  /** "full": avatar, name and plan (open sidebar). "avatar": avatar only (rail, phone bar). */
  variant: "full" | "avatar";
  /** Which side the menu opens towards. */
  side?: "top" | "bottom" | "right";
}

const firstName = (user: UserProfile) => user.firstName?.trim().split(/\s+/)[0] || user.email || "You";
const initial = (user: UserProfile) => (user.firstName?.trim()[0] || user.email?.[0] || "U").toUpperCase();
const fullName = (user: UserProfile) => [user.firstName, user.lastName].map((p) => p?.trim()).filter(Boolean).join(" ") || user.email || "You";
/** "Scholar plan", "Free plan": sentence case, and never "Scholar Plan plan". */
const planLabel = (user: UserProfile, isPaid: boolean) => {
  const name = (user.planName || (isPaid ? "Premium" : "Free")).trim().replace(/s*plan$/i, "");
  return `${name.charAt(0).toUpperCase()}${name.slice(1).toLowerCase()} plan`;
};

/** The paid ring only where the plan isn't written next to it (rail and phone bar). */
const Avatar = ({ user, isPaid, showPlanRing }: { user: UserProfile; isPaid: boolean; showPlanRing: boolean }) => (
  <span
    className={cn(
      "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold",
      // Paid plans get a brand ring; no gradients (MASTER.md)
      isPaid && showPlanRing && "ring-2 ring-brand-orange/70 ring-offset-2 ring-offset-card",
    )}
    aria-hidden="true"
  >
    {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : initial(user)}
  </span>
);

const AccountMenu = ({ user, isLoading, hasError, isPaid, onSignOut, variant, side = "top" }: AccountMenuProps) => {
  const location = useLocation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  if (isLoading) {
    return (
      <span className="flex min-h-11 items-center gap-3 px-2" aria-label="Loading your account">
        <span className="h-9 w-9 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        {variant === "full" && <span className="h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />}
      </span>
    );
  }

  if (!user) {
    return (
      <span className="flex min-h-11 items-center px-2 text-xs text-destructive">
        {hasError ? "Account unavailable" : ""}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        ref={triggerRef}
        aria-label={`Account: ${firstName(user)}, ${planLabel(user, isPaid)}`}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-xl text-left hover:bg-muted",
          variant === "full" ? "w-full px-2 py-1.5" : "min-w-11 justify-center",
          PRESSABLE,
          FOCUS_RING,
        )}
      >
        <Avatar user={user} isPaid={isPaid} showPlanRing={variant === "avatar"} />
        {variant === "full" && (
          <>
            <span className="min-w-0 flex-1" aria-hidden="true">
              <span className="block truncate text-sm font-semibold">{firstName(user)}</span>
              <span className="block truncate text-xs text-muted-foreground">{planLabel(user, isPaid)}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        // Beside the rail it grows upwards from the avatar, so it never runs off the bottom
        align={side === "top" ? "start" : "end"}
        collisionPadding={8}
        className="fasiti-theme w-60 rounded-xl"
      >
        <DropdownMenuLabel className="font-normal">
          {/* The full name here; the button keeps it short */}
          <span className="block truncate text-sm font-semibold">{fullName(user)}</span>
          {user.email && <span className="block truncate text-xs text-muted-foreground">{user.email}</span>}
          <span className="mt-0.5 block text-xs text-muted-foreground">{planLabel(user, isPaid)}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="min-h-11 cursor-pointer gap-2">
          <Link {...settingsAddress(location)} onClick={() => setSettingsReturnFocus(triggerRef.current)}>
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        {!isPaid && (
          <DropdownMenuItem asChild className="min-h-11 cursor-pointer gap-2">
            <Link to="/upgrage">
              <Crown className="h-4 w-4 text-brand-text" aria-hidden="true" />
              Upgrade to Premium
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {/* Signing out is undone by signing in: no alarm red */}
        <DropdownMenuItem onSelect={onSignOut} className="min-h-11 cursor-pointer gap-2">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
