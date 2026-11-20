import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import BrandMark from "./BrandMark";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import SiteNav from "./SiteNav";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Quote,
  Star,
  TrendingUp,
  UserPlus,
} from "lucide-react";

const orange = "hsl(var(--brand-orange))";

// ── Data ────────────────────────────────────────────────────────────────────

const PARTNERS = [
  {
    logoText: "PrepClass",
    color: "#2b6cb0",
    logo: null, // swap with real logo path when available
  },
  {
    logoText: "uLesson",
    color: "#1f4f99",
    logo: null,
  },
  {
    logoText: "AltSchool",
    color: "#0f766e",
    logo: null,
  },
  {
    logoText: "Tuteria",
    color: "#7c2d12",
    logo: null,
  }
];

const REVIEWS = [
  {
    name: "Chioma Okonkwo",
    school: "Medicine · UNILAG 2024",
    initials: "CO",
    stars: 5,
    scoreBefore: 220,
    scoreAfter: 298,
    quote:
      "The practice tests feel remarkably close to the real exam experience. The analytics helped me pinpoint my exact weak areas — I knew what to fix every single week. My score jumped 78 points.",
  },
  {
    name: "Emeka Eze",
    school: "Engineering · UNIBEN",
    initials: "EE",
    stars: 5,
    scoreBefore: null,
    scoreAfter: null,
    quote:
      "The AI explanations for questions I got wrong were a complete game changer. It is like having a personal tutor available at 3 a.m. before your exam. Nothing else comes close.",
  },
  {
    name: "Tunde Bakare",
    school: "Economics · OAU",
    initials: "TB",
    stars: 4,
    scoreBefore: null,
    scoreAfter: null,
    quote:
      "The leaderboard kept me grinding harder than I ever would have alone. Watching my national rank climb every week was addictive. The study recommendations were exactly on point.",
  },
  {
    name: "Amaka Ibrahim",
    school: "Law · University of Abuja",
    initials: "AI",
    stars: 5,
    scoreBefore: 195,
    scoreAfter: 271,
    quote:
      "I used to spend hours figuring out what to study next. Fasiti cut that to nothing — I just followed the personalised plan and my score climbed 76 points in two months.",
  },
  {
    name: "David Osei",
    school: "Pharmacy · UNIJOS",
    initials: "DO",
    stars: 5,
    scoreBefore: null,
    scoreAfter: null,
    quote:
      "The CBT interface is spot-on. When I finally sat my exam, the environment felt completely familiar. No surprises, no format anxiety — just pure confidence on the day.",
  },
  {
    name: "Fatima Abubakar",
    school: "Medicine · ABU Zaria",
    initials: "FA",
    stars: 5,
    scoreBefore: 190,
    scoreAfter: 265,
    quote:
      "After two months on Fasiti I did not just know the material — I knew how to think through questions under real exam pressure. That mental shift made all the difference.",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const [reviewApi, setReviewApi] = useState<CarouselApi>();
  const [reviewCurrent, setReviewCurrent] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (!reviewApi) return;
    const onSelect = () => setReviewCurrent(reviewApi.selectedScrollSnap());
    setReviewCount(reviewApi.scrollSnapList().length);
    setReviewCurrent(reviewApi.selectedScrollSnap());
    reviewApi.on("select", onSelect);
    return () => { reviewApi.off("select", onSelect); };
  }, [reviewApi]);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navigation ──────────────────────────────────────────── */}
      <SiteNav />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Features ────────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── How It Works ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24" style={{ backgroundColor: "hsl(222.2,47.4%,6%)" }}>
        <div className="container">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: orange }}>
              How It Works
            </p>
            <h2 className="text-3xl font-black text-white md:text-4xl">
              Three steps to exam-ready confidence
            </h2>
          </div>

          <div className="hidden md:grid md:grid-cols-3">
            {[
              {
                icon: UserPlus,
                step: "01",
                title: "Create Your Account",
                desc: "Sign up free in under a minute. Pick your subjects and set your exam date.",
              },
              {
                icon: ClipboardList,
                step: "02",
                title: "Take Practice Tests",
                desc: "Start with realistic timed tests. The interface mirrors modern digital exam conditions — so nothing surprises you on exam day.",
              },
              {
                icon: TrendingUp,
                step: "03",
                title: "Track & Improve",
                desc: "Review your analytics, follow AI study recommendations, and watch your score climb.",
              },
            ].map(({ icon: Icon, step, title, desc }, i) => (
              <div key={step} className="relative flex flex-col items-center px-8 text-center">
                {i < 2 && (
                  <div
                    className="absolute left-1/2 top-8 h-px w-full opacity-25"
                    style={{ background: orange }}
                  />
                )}
                <div
                  className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: orange }}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: orange }}>
                  Step {step}
                </p>
                <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
                <p className="text-sm text-white/60">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-10 md:hidden">
            {[
              { icon: UserPlus, step: "01", title: "Create Your Account", desc: "Sign up free in under a minute. Pick your subjects and set your exam date." },
              { icon: ClipboardList, step: "02", title: "Take Practice Tests", desc: "Start with realistic timed tests that mirror modern digital exam conditions." },
              { icon: TrendingUp, step: "03", title: "Track & Improve", desc: "Review analytics, follow AI study recommendations, and watch your score climb." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: orange }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-0.5 text-xs font-bold uppercase tracking-widest" style={{ color: orange }}>Step {step}</p>
                  <h3 className="mb-1 text-lg font-bold text-white">{title}</h3>
                  <p className="text-sm text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link to="/signup">
              <Button size="lg" className="gap-2 px-8 text-white" style={{ backgroundColor: orange }}>
                Get Started — It's Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Reviews Carousel ────────────────────────────────────── */}
      <section id="reviews" className="overflow-hidden py-24 bg-background">
        <div className="container">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: orange }}>
              Student Stories
            </p>
            <h2 className="text-3xl font-black md:text-4xl">
              Real students. Real results.
            </h2>
          </div>

          <Carousel setApi={setReviewApi} opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {REVIEWS.map((review) => (
                <CarouselItem key={review.name}>
                  <div className="flex flex-col items-center px-4 text-center md:px-24 lg:px-40">
                    {/* Decorative quote mark */}
                    <Quote
                      className="mb-6 h-14 w-14 rotate-180"
                      style={{ color: orange }}
                      strokeWidth={1.5}
                    />

                    {/* Score badge */}
                    {review.scoreBefore && review.scoreAfter && (
                      <div
                        className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white"
                        style={{ backgroundColor: orange }}
                      >
                        <span>{review.scoreBefore}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{review.scoreAfter}</span>
                      </div>
                    )}

                    {/* Quote text */}
                    <p className="mb-10 max-w-3xl text-xl font-medium italic leading-relaxed text-foreground md:text-2xl">
                      {review.quote}
                    </p>

                    {/* Stars */}
                    <div className="mb-5 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5"
                          style={{
                            fill: i < review.stars ? orange : "transparent",
                            color: orange,
                          }}
                        />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-white"
                        style={{ backgroundColor: orange }}
                      >
                        {review.initials}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">{review.name}</p>
                        <p className="text-sm text-muted-foreground">{review.school}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-center gap-5">
            <button
              onClick={() => reviewApi?.scrollPrev()}
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-secondary"
              aria-label="Previous review"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: reviewCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => reviewApi?.scrollTo(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === reviewCurrent ? "2rem" : "0.5rem",
                    backgroundColor: i === reviewCurrent ? orange : "hsl(var(--border))",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => reviewApi?.scrollNext()}
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-secondary"
              aria-label="Next review"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Partnerships ────────────────────────────────────────── */}
      <section id="partners" className="py-20" style={{ backgroundColor: "hsl(0,0%,96%)" }}>
        <div className="container">
          <div className="mb-12 flex flex-col items-center text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: orange }}>
              Educational Partners
            </p>
            <h2 className="text-3xl font-black md:text-4xl">
              Learning center partners
            </h2>
            <p className="mt-3 max-w-3xl text-base text-muted-foreground">
              Fasiti collaborates with top learning platforms, tutoring centers, and digital academies
              focused on helping students improve faster and score higher.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            {/* Partner logo grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {PARTNERS.map((partner) => (
              <div
                key={partner.logoText}
                className="flex h-20 items-center justify-center rounded-2xl border bg-card px-5"
              >
                {/* Logo container — swap partner.logo with a real <img> when available */}
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={`${partner.logoText} logo`}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center rounded-xl px-2 text-center text-xl font-black tracking-tight"
                      style={{ color: partner.color }}
                    >
                      {partner.logoText}
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-3">
            <Link to="/partners">
              <Button className="gap-2 px-7 text-white" style={{ backgroundColor: orange }}>
                Full Directory
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="gap-2 border-transparent bg-transparent font-semibold hover:bg-transparent" style={{ color: "hsl(var(--foreground))" }}>
                Join Now
                <ChevronRight className="h-4 w-4" style={{ color: orange }} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: orange }}>
        <div className="container text-center">
          <h2 className="text-3xl font-black text-white md:text-4xl">
            Your exam date is coming.
            <br />
            Are you ready?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Join thousands of Nigerian students already preparing smarter with Fasiti.
            It's free to start.
          </p>
          <div className="mt-10">
            <Link to="/signup">
              <Button
                size="lg"
                className="gap-2 px-10 font-bold"
                style={{ backgroundColor: "white", color: orange }}
              >
                Start Practicing Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Reviews", href: "#reviews" },
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
