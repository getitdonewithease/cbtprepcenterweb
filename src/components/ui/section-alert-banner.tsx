import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/ui/cn";

interface SectionAlertBannerProps {
  title?: string;
  description: string;
  onDismiss?: () => void;
  className?: string;
}

export function SectionAlertBanner({
  title,
  description,
  onDismiss,
  className,
}: SectionAlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          {title ? <p className="font-semibold">{title}</p> : null}
          <p className={title ? "mt-0.5" : ""}>{description}</p>
        </div>
        {onDismiss ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Dismiss alert"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
