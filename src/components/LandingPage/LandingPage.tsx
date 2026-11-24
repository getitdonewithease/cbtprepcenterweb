import { Link } from "react-router-dom";
import { cn } from "@/core/ui/cn";
import { useThemePreference } from "@/core/theme/useThemePreference";
import BrandMark from "./BrandMark";
import CtaSection from "./CtaSection";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import SiteNav from "./SiteNav";
import { ArrowRight, ChevronRight } from "lucide-react";

// ── Component ────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const { theme, toggleTheme } = useThemePreference();

  return (
    <div
      className={cn(
        "fasiti-theme min-h-screen bg-background text-foreground antialiased",
        theme === "dark" && "dark",
      )}
    >

      {/* ── Navigation ──────────────────────────────────────────── */}
      <SiteNav theme={theme} onToggleTheme={toggleTheme} />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <HeroSection theme={theme} />

      {/* ── Features ────────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── How It Works ────────────────────────────────────────── */}
      <section id="how-it-works" className="border-y bg-muted/60 py-24">
        <div className="container">
          <h2 className="mb-14 max-w-2xl text-balance font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">
            Three steps to exam-ready confidence
          </h2>

          {/* One ordered list for every width: the number is the marker, no icon tiles */}
          <ol className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                title: "Create your account",
                desc: "Sign up free in under a minute. Pick your four subjects and set a target score.",
              },
              {
                title: "Take timed mocks",
                desc: "Sit four-subject UTME mocks against the clock, in the same computer-based format as exam day.",
              },
              {
                title: "Learn and improve",
                desc: "Read the explanation for every question you miss, study your weakest topics, and take the next mock.",
              },
            ].map(({ title, desc }, i) => (
              <li key={title} className="border-t-2 border-brand-orange/40 pt-6">
                <span className="font-display text-4xl font-extrabold tabular-nums text-brand-text" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 max-w-prose text-pretty text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ol>

          <Link
            to="/signup"
            className="mt-12 inline-flex items-center gap-1.5 rounded-md text-base font-semibold text-brand-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start free practice
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── For tutoring centres ───────────────────────────────── */}
      {/* Honest placeholder: the centre offering is not built yet (PRODUCT.md) */}
      <section id="centres" className="py-24">
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-balance font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">
                For tutoring centres and schools
              </h2>
              <p className="mt-4 max-w-prose text-pretty text-muted-foreground">
                Group accounts for tutoring centres and schools are on the way. Until then, your
                students can each sign up and practise with their own free account.
              </p>
            </div>
            <ul className="space-y-3 rounded-2xl border bg-card p-6 shadow-soft md:p-8">
              {[
                "Every student takes timed, four-subject UTME mocks",
                "Each gets AI explanations for the questions they miss",
                "Each sees the topics they should study next",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" aria-hidden="true" />
                  {point}
                </li>
              ))}
              <li className="pt-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-brand-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Create a free student account
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Closing CTA: navy bookend ───────────────────────────── */}
      <CtaSection />

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t bg-background py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <BrandMark className="mb-2" />
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Study smart, Ace With Ease
              </p>
              <p className="mb-5 max-w-sm text-sm text-muted-foreground">
                A comprehensive digital exam preparation platform for ambitious learners.
              </p>
              <div className="flex gap-4">
                <a href="#" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="#" aria-label="Twitter" className="text-muted-foreground transition-colors hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold">Quick Links</h3>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Process", href: "#how-it-works" },
                  { label: "For centres", href: "#centres" },
                  { label: "Sign In", href: "/signin" },
                  { label: "Sign Up", href: "/signup" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold">Legal</h3>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Contact Us", href: "/contact" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fasiti. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
