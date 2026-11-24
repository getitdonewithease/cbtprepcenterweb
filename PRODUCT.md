# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: UTME candidates.** Nigerian secondary-school leavers preparing for the JAMB UTME, a computer-based test (CBT) taken in four subjects and scored out of 400. Their job: practise under exam conditions, understand what they got wrong, and raise their score before exam day.
- **Also: tutoring centres and schools** that prepare groups of candidates. Confirmed as an audience; what the product offers them specifically (group accounts, centre dashboards, partner listings) is not yet decided.
- Open: which device candidates mostly study on (phone, laptop, or CBT/cyber centre machines) has not been established. Do not assume one.

## Product Purpose

Fasiti helps candidates prepare for digital exams by practising in timed CBT sessions, learning from every mistake, and knowing what to study next. Success means a candidate walks into the exam familiar with the format and reaches their target score (most competitive courses ask for 250+ out of 400).

## Positioning

Fasiti's distinctive claims, in the owner's order of priority:

1. **AI tutor on wrong answers:** step-by-step explanations for every question a candidate gets wrong, available at any hour.
2. **Personal study plan:** analytics find each candidate's weak topics and say exactly what to study next.
3. **National leaderboard:** candidates rank against others across Nigeria.

**Timed CBT practice** is a core feature and must be shown wherever features are listed (including the landing page), but it is not unique to Fasiti: other UTME products offer it. Present it as the foundation the differentiators build on, not as the unique claim.

## Operating Context

- Candidates pick an exam, choose exactly 4 subjects (UTME), and set a target score (100 to 400, default 250).
- Core loop: timed practice test → submission → summary → question-by-question review with AI explanations → saved questions and recommendations → next test.
- Supporting rituals: daily challenge, test history, leaderboard, subscription upgrade.
- Routes: `/`, `/signin`, `/signup`, `/complete-profile`, `/dashboard`, `/subjects`, `/resources`, `/practice/test/:id`, `/practice/summary/:id`, `/practice/review/:id`, `/saved-questions`, `/daily-challenge/:date`, `/test-history`, `/leaderboard`, `/settings`, `/upgrage`.

## Capabilities and Constraints

- **Live exam:** UTME only. Post-UTME, WAEC, NECO, SAT, IELTS and TOEFL exist in the exam catalogue as "coming soon" and must not be presented as available.
- **Plans:** a free plan (₦0, "always free") and paid plans billed monthly in naira; prices come from the backend.
- **Content:** exam questions can contain LaTeX (rendered with KaTeX).
- **Stack (existing):** React 18, TypeScript, Vite, Tailwind, shadcn/Radix, framer-motion. Engineering and design conventions live in `CLAUDE.md`.
- Undecided: the tutoring-centre offering; the primary study device.

## Brand Commitments

- Name: **Fasiti**. Tagline in use: "Study smart, Ace With Ease".
- No final logo yet. `public/FasitiLogo.jpeg` (stacked-blocks "F") and `public/fasiti_logo.png` (brain and bulb) are drafts; the site currently uses a stand-in "stack" mark (`src/components/LandingPage/BrandMark.tsx`).
- Brand colour roles (orange accent, navy grounds) are defined in `CLAUDE.md` and `src/index.css`.

## Evidence on Hand

- **No real testimonials yet.** The placeholder Reviews section was removed from the landing page; add testimonials only once they are real and approved.
- **No real partnerships yet.** The placeholder Partners section (PrepClass, uLesson, AltSchool, Tuteria) was replaced by an honest "For tutoring centres and schools, coming soon" block.
- **No verified user counts.** Claims such as "10,000+ candidates" or "thousands of Nigerian students" are unverified and have been removed.
- Future work must not present invented testimonials, partners or figures as real.

## Product Principles

1. **Every mistake teaches.** A wrong answer should always lead to an explanation the candidate can follow.
2. **Tell them what's next.** Practice should end with a clear next step, not just a score.
3. **Honest progress.** Scores, ranks and claims are real or clearly marked as examples; no invented proof.
4. **Exam-day familiarity.** Practice should feel calm and familiar under time pressure, so the real test holds no surprises.
5. **Only what exists.** Show live exams and features as live; everything else is "coming soon".

## Accessibility & Inclusion

`CLAUDE.md` requires keyboard reachability, semantic HTML, labelled inputs, focus management for modals and panels, and handling of empty, loading, error and success states. No formal WCAG level has been set.
