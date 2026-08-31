import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Crown,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/core/ui/cn";
import { subscriptionPlans } from "../data/subscriptionPlans";
import type { BillingCycle, SubscriptionPlan } from "../types/subscriptionTypes";

const orange = "hsl(var(--brand-orange))";

const planIcons = {
  starter: GraduationCap,
  pro: Sparkles,
  max: Crown,
};

const formatPrice = (plan: SubscriptionPlan, billingCycle: BillingCycle) => {
  const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  return price === 0 ? "$0" : `$${price}`;
};

const getBillingNote = (plan: SubscriptionPlan, billingCycle: BillingCycle) =>
  billingCycle === "yearly" ? plan.yearlyBillingNote : plan.monthlyBillingNote;

const SubscriptionPlanPage = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");

  const annualSavings = useMemo(() => {
    const proPlan = subscriptionPlans.find((plan) => plan.id === "pro");

    if (!proPlan || proPlan.monthlyPrice === 0) {
      return "Save yearly";
    }

    const savings = Math.round(
      ((proPlan.monthlyPrice - proPlan.yearlyPrice) / proPlan.monthlyPrice) * 100,
    );

    return `Save ${savings}%`;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Button variant="ghost" asChild className="h-9 px-2 text-muted-foreground">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Upgrade
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

            <Tabs
              value={billingCycle}
              onValueChange={(value) => setBillingCycle(value as BillingCycle)}
              className="mt-6"
            >
              <TabsList className="h-11 rounded-lg">
                <TabsTrigger value="monthly" className="h-9 rounded-md px-5">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="yearly" className="h-9 rounded-md px-5">
                  Yearly
                  <span className="ml-2 text-xs" style={{ color: orange }}>
                    {annualSavings}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => {
              const Icon = planIcons[plan.id as keyof typeof planIcons] ?? BadgeCheck;
              const isHighlighted = Boolean(plan.highlighted);

              return (
                <article
                  key={plan.id}
                  className={cn(
                    "flex min-h-[620px] flex-col overflow-hidden rounded-lg border bg-card shadow-sm",
                    isHighlighted && "border-[hsl(var(--brand-orange))] shadow-xl",
                  )}
                >
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-8 flex items-start justify-between gap-3">
                      <div
                        className="inline-flex h-12 w-12 items-center justify-center rounded-lg"
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

                    <div className="mt-8">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black tracking-tight">
                          {formatPrice(plan, billingCycle)}
                        </span>
                        <span className="pb-1 text-sm text-muted-foreground">
                          USD / month
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {getBillingNote(plan, billingCycle)}
                      </p>
                    </div>

                    <Button
                      className={cn(
                        "mt-8 h-11 w-full text-sm font-semibold",
                        isHighlighted
                          ? "text-white hover:opacity-95"
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
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex gap-3 text-sm leading-6">
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

                  <div className="border-t bg-muted/30 px-6 py-5">
                    <ul className="space-y-2">
                      {plan.limits.map((limit) => (
                        <li
                          key={limit}
                          className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
                        >
                          <Zap className="h-3.5 w-3.5" style={{ color: orange }} />
                          {limit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPlanPage;
