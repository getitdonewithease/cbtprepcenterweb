import React from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SubscriptionPlan } from "../types/subscriptionTypes";

const orange = "hsl(var(--brand-orange))";

export interface SubscriptionCheckoutModalProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: SubscriptionPlan) => void;
  isProcessing: boolean;
  userEmail?: string;
  studentName?: string;
  period: {
    startPeriod: string;
    endPeriod: string;
  };
}

const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  userEmail,
  studentName,
  period,
}) => {
  if (!plan) return null;

  const formattedStart = formatDisplayDate(period.startPeriod);
  const formattedEnd = formatDisplayDate(period.endPeriod);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border bg-card sm:rounded-2xl">
        <div className="p-6 pb-4">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "hsl(25 95% 53% / 0.12)" }}
              >
                <CreditCard className="h-5 w-5" style={{ color: orange }} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground">
                  Order Summary
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Review your subscription details before heading to secure checkout
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Plan Info Card */}
          <div className="mt-4 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  {plan.badge && (
                    <span
                      className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        borderColor: "hsl(25 95% 53% / 0.35)",
                        color: orange,
                        backgroundColor: "hsl(25 95% 53% / 0.08)",
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{plan.audience}</p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black tracking-tight text-foreground">
                  {plan.formattedPrice}
                </span>
                <span className="text-xs text-muted-foreground"> / month</span>
              </div>
            </div>

            {/* Billing Period */}
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
              <span className="font-medium text-muted-foreground">Billing Period</span>
              <span className="font-semibold text-foreground">
                {formattedStart} &ndash; {formattedEnd} (30 days)
              </span>
            </div>
          </div>

          {/* Student Account Attribution */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border bg-background p-3 text-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-muted-foreground">Activating for student:</p>
              <p className="truncate font-semibold text-foreground">
                {studentName ? `${studentName} • ` : ""}
                {userEmail || "Your account"}
              </p>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: "hsl(25 95% 53% / 0.12)",
                color: orange,
              }}
            >
              Instant Access
            </span>
          </div>

          {/* Key Features Included */}
          {plan.features && plan.features.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Included with {plan.name}
              </p>
              <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs">
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-foreground/90">
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: orange }} />
                    <span className="truncate">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust / Paystack Guarantee */}
          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Secured by Paystack</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Accepts Debit/Credit Cards, Bank Transfers, and USSD. You can cancel your subscription renewal at any time.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <DialogFooter className="border-t bg-muted/20 p-4 sm:flex-row sm:justify-between sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs font-semibold h-10 w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => onConfirm(plan)}
            disabled={isProcessing}
            className="h-10 w-full text-xs font-semibold text-white shadow-md hover:opacity-95 sm:w-auto min-w-[180px]"
            style={{ backgroundColor: orange }}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting to Paystack...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Proceed to Paystack
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionCheckoutModal;
