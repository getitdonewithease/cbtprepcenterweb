import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  Crown,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/core/ui/cn";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";

const orange = "hsl(var(--brand-orange))";

const getPlanIcon = (slug?: string, index?: number) => {
  const normalized = slug?.toLowerCase();
  if (normalized === "free" || normalized === "starter" || index === 0) {
    return GraduationCap;
  }
  if (normalized === "scholar" || normalized === "pro" || index === 1) {
    return Sparkles;
  }
  if (normalized === "fellowship" || normalized === "max" || index === 2) {
    return Crown;
  }
  return BadgeCheck;
};

const SubscriptionPlanSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex min-h-[520px] flex-col rounded-2xl border bg-card p-6 shadow-sm animate-pulse"
        >
          <div className="mb-8 flex items-start justify-between">
            <div className="h-12 w-12 rounded-xl bg-muted" />
            {i === 2 ? <div className="h-6 w-20 rounded-full bg-muted" /> : null}
          </div>
          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-8 w-40 rounded bg-muted" />
            <div className="h-12 w-full rounded bg-muted" />
          </div>
          <div className="mt-8 space-y-2">
            <div className="h-10 w-32 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="mt-8 h-11 w-full rounded-lg bg-muted" />
          <div className="mt-8 space-y-3 border-t pt-6">
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
};

const SubscriptionPlanPage = () => {
  const { plans, isLoading, error, refetch } = useSubscriptionPlans();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Button variant="ghost" asChild className="h-9 px-2 text-muted-foreground">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          <div className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm sm:flex">
            <ShieldCheck className="h-4 w-4" style={{ color: orange }} />
            Secure checkout coming soon
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-7xl">
          <section className="mb-10 text-center">
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: orange }}
            >
              Premium Plans
            </p>
            <h1 className="mt-3 text-3xl font-black text-foreground md:text-4xl">
              Plans that grow with your preparation
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Choose the level of AI help, analytics, and practice capacity that matches
              your current exam goals.
            </p>
          </section>

          {isLoading ? (
            <SubscriptionPlanSkeleton />
          ) : error ? (
            <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Unable to load plans</h2>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button
                onClick={() => refetch()}
                className="mt-6 gap-2 text-sm"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const Icon = getPlanIcon(plan.slug, index);
                const isHighlighted = Boolean(plan.highlighted);

                return (
                  <article
                    key={plan.id}
                    className={cn(
                      "flex min-h-[560px] flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
                      isHighlighted && "border-[hsl(var(--brand-orange))] shadow-xl ring-1 ring-[hsl(var(--brand-orange))]",
                    )}
                  >
                    <div className="flex flex-1 flex-col">
                      <div className="mb-6 flex items-start justify-between gap-3">
                        <div
                          className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: "hsl(25 95% 53% / 0.12)" }}
                        >
                          <Icon className="h-6 w-6" style={{ color: orange }} />
                        </div>
                        {plan.badge ? (
                          <span
                            className="rounded-full border px-3 py-1 text-xs font-semibold"
                            style={{
                              borderColor: "hsl(25 95% 53% / 0.35)",
                              color: orange,
                              backgroundColor: "hsl(25 95% 53% / 0.08)",
                            }}
                          >
                            {plan.badge}
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {plan.audience}
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-foreground">
                          {plan.name}
                        </h2>
                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-black tracking-tight">
                            {plan.formattedPrice}
                          </span>
                          <span className="pb-1 text-sm text-muted-foreground">
                            / month
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {plan.billingNote}
                        </p>
                      </div>

                      <Button
                        className={cn(
                          "mt-6 h-11 w-full text-sm font-semibold transition-all",
                          isHighlighted
                            ? "text-white shadow-md hover:opacity-95"
                            : "border bg-background text-foreground hover:bg-muted",
                        )}
                        style={isHighlighted ? { backgroundColor: orange } : undefined}
                        variant={isHighlighted ? "default" : "outline"}
                      >
                        {plan.ctaLabel}
                      </Button>

                      <div className="mt-8 border-t pt-6">
                        <p className="mb-4 text-sm font-semibold text-foreground">
                          {plan.includedLabel}
                        </p>
                        <ul className="space-y-3">
                          {plan.features.map((feature, fIndex) => (
                            <li key={`${feature}-${fIndex}`} className="flex gap-3 text-sm leading-6">
                              <Check
                                className="mt-0.5 h-4 w-4 shrink-0"
                                style={{ color: orange }}
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPlanPage;
