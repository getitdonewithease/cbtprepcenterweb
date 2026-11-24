import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/core/ui/cn";

/**
 * Small building blocks shared by the sign-in, sign-up and forgot-password panels.
 * Styled from the design-system tokens (design-system/fasiti/MASTER.md): 44px controls,
 * rounded-xl, bg-primary buttons, text-brand-text links.
 */

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// ── Field ────────────────────────────────────────────────────────────────────

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: ReactNode;
  /** Adds a show/hide control for password fields */
  isPassword?: boolean;
  labelAction?: ReactNode;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, icon: Icon, error, hint, isPassword, labelAction, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={inputId} className="text-sm font-semibold">
            {label}
          </label>
          {labelAction}
        </div>
        <div className="relative">
          {Icon ? (
            <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={isPassword ? (isVisible ? "text" : "password") : props.type}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-card px-3.5 text-base shadow-soft transition-colors placeholder:text-muted-foreground sm:text-sm",
              "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
              Icon && "pl-11",
              isPassword && "pr-12",
              error ? "border-destructive" : "border-input",
              className,
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setIsVisible((v) => !v)}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              className={cn(
                "absolute right-1 top-1/2 flex h-9 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground",
                FOCUS_RING,
              )}
            >
              {isVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          ) : null}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
AuthField.displayName = "AuthField";

// ── Buttons and links ────────────────────────────────────────────────────────

export const primaryButtonClass = cn(
  "inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-soft",
  "transition-[transform,filter,opacity] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]",
  "disabled:pointer-events-none disabled:opacity-50",
  FOCUS_RING,
);

export const secondaryButtonClass = cn(
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border bg-card px-5 text-base font-medium shadow-soft transition-colors hover:bg-secondary",
  "disabled:pointer-events-none disabled:opacity-50",
  FOCUS_RING,
);

export const textLinkClass = cn(
  "inline-flex items-center gap-1 rounded-md font-semibold text-brand-text underline-offset-4 hover:underline",
  FOCUS_RING,
);

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const TextButton = ({ className, children, ...props }: TextButtonProps) => (
  <button type="button" className={cn(textLinkClass, className)} {...props}>
    {children}
  </button>
);

// ── Divider ──────────────────────────────────────────────────────────────────

export const OrDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 text-sm text-muted-foreground" role="separator" aria-label={label}>
    <span className="h-px flex-1 bg-border" aria-hidden="true" />
    <span aria-hidden="true">{label}</span>
    <span className="h-px flex-1 bg-border" aria-hidden="true" />
  </div>
);

// ── Error banner: announced and focused when it appears ──────────────────────

export const AuthErrorBanner = ({ message }: { message: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);

  if (!message) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
};

// ── Panel heading: focused on mount so screen readers land on the new view ───

interface PanelHeadingProps {
  title: string;
  subtitle?: ReactNode;
  focusOnMount?: boolean;
}

export const PanelHeading = ({ title, subtitle, focusOnMount = true }: PanelHeadingProps) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus({ preventScroll: true });
  }, [focusOnMount, title]);

  return (
    <div>
      <h1
        ref={ref}
        tabIndex={-1}
        className="text-balance font-display text-3xl font-extrabold tracking-[-0.02em] outline-none"
      >
        {title}
      </h1>
      {subtitle ? <p className="mt-2 text-pretty text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
};
