// Class recipes from design-system/fasiti/MASTER.md that more than one component needs

export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** The 2% press is immediate; under reduced motion only the colour changes. */
export const PRESSABLE =
  "transition-[transform,filter,background-color,border-color] duration-200 ease-soft-out motion-safe:active:scale-[0.98] motion-reduce:transition-none";

export const PRIMARY_ACTION =
  "bg-primary text-primary-foreground shadow-soft hover:brightness-110 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 active:brightness-95";

export const SECONDARY_ACTION =
  "border border-muted-foreground/60 text-foreground hover:bg-muted active:bg-border";

/** A 44px close target whose icon stays where the shared dialog draws it. */
export const CLOSE_TARGET =
  "right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-xl";

/** Enter in 200ms, leave faster. */
export const OVERLAY_MOTION =
  "ease-soft-out data-[state=open]:duration-200 data-[state=closed]:duration-150";
