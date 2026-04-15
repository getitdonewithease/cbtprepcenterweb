# Fasiti Design System & UI/UX Guidelines

## 🎨 Color Palette

### Primary Colors

- **Primary Blue**: `#2563EB` - Main brand color, authoritative and professional
- **Primary Blue (Dark)**: `#1D4ED8` - Hover state and emphasis
- **Purple Accent**: `#7C3AED` - Secondary brand color, adds energy

### Supporting Palette (Inspired by Nigerian Educational Heritage)

- **Energetic Gold**: `#FCD34D` - Achievement, success
- **Growth Green**: `#10B981` - Positive momentum, progress
- **Warm Orange**: `#FB923C` - Engagement, warmth
- **Cool Teal**: `#14B8A6` - Trust, learning

### Neutral Colors

- **Light Background**: `#F3F4F6` (Light mode)
- **Dark Background**: `#0F172A` (Dark mode)
- **Card Background**: `#FFFFFF` (Light mode)
- **Text Foreground**: Primary text color varies by theme

### Color Usage

- **CTAs**: Gradient from Blue → Purple (high-converting)
- **Progress Indicators**: Green tints (psychological association with progress)
- **Icon Backgrounds**: Gradient versions of primary colors
- **Hover States**: Lighter/darker variants + subtle glow effect

---

## 📝 Typography System

### Font Pairing

**Heading Font**: System Sans-Serif (or "Inter" if available)

- Weight: 700 (Bold) for primary headings
- Weight: 600 (Semibold) for subheadings
- Use case: All headings (h1, h2, h3)

**Body Font**: System Sans-Serif (or "SF Pro Display")

- Weight: 400 (Regular) for body text
- Weight: 500 (Medium) for emphasis
- Line-height: 1.6 for readability
- Letter-spacing: normal

### Typography Scale

- **H1 (Hero)**: `3.75rem` (60px) / 1.1 line-height
- **H2 (Section)**: `2.25rem` (36px) / 1.2 line-height
- **H3 (Feature)**: `1.25rem` (20px) / 1.3 line-height
- **Body Large**: `1.125rem` (18px) / 1.6 line-height
- **Body**: `1rem` (16px) / 1.6 line-height
- **Body Small**: `0.875rem` (14px) / 1.5 line-height
- **Caption**: `0.75rem` (12px) / 1.4 line-height

### Weight Usage

- **Logo/Brand**: 700 (Bold) + Gradient
- **Headlines**: 700 (Bold)
- **Subheadings**: 600 (Semibold)
- **Buttons**: 600 (Semibold)
- **Body**: 400 (Regular)
- **Captions**: 500 (Medium)

---

## ✨ Micro-Interactions & Animations

### 1. **Float Animation** (Dashboard Card)

```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}
animation: float 3s ease-in-out infinite;
```

**Purpose**: Creates a sense of lightness and elevation on the dashboard preview card
**Trigger**: Automatic on page load
**Duration**: 3 seconds
**Feel**: Smooth, playful, inviting

### 2. **Slide-Up & Fade-In Animation** (Content Elements)

```css
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: slide-up 0.6s ease-out forwards;
```

**Purpose**: Smooth entrance for hero section elements
**Trigger**: Page load (staggered)
**Duration**: 0.6 seconds per element
**Stagger**: 0.2s between elements
**Feel**: Modern, professional, progressive disclosure

### 3. **Hover Scale & Glow Effect** (Interactive Cards)

```css
/* Icon Container */
group-hover:scale-110 transition-transform duration-300

/* Card Border Glow */
hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300
```

**Purpose**: Provides visual feedback that elements are interactive
**Trigger**: Mouse hover (desktop), tap/focus (mobile)
**Duration**: 300ms
**Feel**: Responsive, engaging, delightful

---

## 🎯 Hero Section Design

### Layout

- **Split Layout**: 50-50 on desktop, stacked on mobile
- **Left Side**: Persuasive copy with clear hierarchy
- **Right Side**: Glassmorphism dashboard mock-up

### Hero Copy Structure

1. **Badge** - "The Future of UTME Preparation"
2. **Headline** - Split color: Blue gradient on "Transform Your UTME Strategy" + neutral on "Score Higher, Study Smarter"
3. **Subheading** - Supporting statement with social proof
4. **Benefit List** - 3 key benefits with icon badges
5. **CTAs** - Primary (Start Free Trial) + Secondary (Sign In)
6. **Social Proof** - Universities list

### Key Conversions Elements

- **Color Psychology**: Blue = Trust, Purple = Innovation
- **Urgency**: "50,000+ students" + "Join" language
- **Clarity**: One primary action (Start Free Trial) is more prominent
- **Social Proof**: University names create credibility

---

## 🎨 Features Section Design

### Section Structure

1. **Header** with badge + headline + subheading
2. **Featured Feature** - Full-width showcase (AI Analytics)
3. **Feature Grid** - 6 cards in 3-column layout

### Card Design

- **Background**: Subtle gradient + backdrop blur (glassmorphism)
- **Icon**: Colored gradient background (unique per feature)
- **Interaction**:
  - Hover: Scale icon (1.1x), change border color, subtle lift (-4px)
  - Hover: Icon background scales up
- **Micro-Details**:
  - Gradient dot bullets instead of checkmarks
  - Smooth hover text color transition

### Color Strategy by Feature

- **Analytics**: Blue (trust in data)
- **Practice**: Blue (learning)
- **Competition**: Purple (achievement)
- **AI Explanations**: Pink (intelligence, warmth)
- **Study Plans**: Emerald (growth)
- **Trends**: Orange (energy, motivation)
- **Achievements**: Yellow (success, positivity)

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px - Single column, larger touch targets
- **Tablet**: 640px - 1024px - Two columns
- **Desktop**: > 1024px - Full layout with split sections

### Mobile Optimizations

1. **Navigation**: Hamburger menu with slide-down animation
2. **Hero**: Full-width stacked layout
3. **Dashboard Mock**: Scaled to fit mobile width
4. **Features**: 1 column layout
5. **Buttons**: Full-width on mobile, auto-width on desktop

---

## 🎨 Background Elements

### Gradient Blobs (Decorative)

- Blue blob: `bg-blue-400 blur-3xl opacity-10`
- Purple blob: `bg-purple-400 blur-3xl opacity-10`
- Pink blob: `bg-pink-300 blur-3xl opacity-5`
- **Purpose**: Visual interest, subtle depth, not distracting
- **Animation**: Pulsing effect with staggered delays

### Gradient Overlays

- Section backgrounds: `from-blue-50 via-background to-purple-50`
- **Purpose**: Subtle visual separation between sections

---

## 🎛️ Interaction Patterns

### Button States

1. **Default**: Gradient blue → purple
2. **Hover**: Darker gradient + shadow expansion
3. **Active**: Slight scale (0.98x) + shadow deepens
4. **Focus**: Visible outline for accessibility

### Link States

- **Hover**: Color transition to blue
- **Focus**: Underline + keyboard focus ring

### Card States

- **Default**: Subtle border + light shadow
- **Hover**: Brighter border + stronger shadow + lift effect
- **Focus**: Keyboard focus ring

---

## ✅ Accessibility Considerations

1. **Color Contrast**:
   - Text on background: > 4.5:1 ratio
   - Interactive elements: Clear focus states

2. **Motion**:
   - Animations respect `prefers-reduced-motion`
   - Animations are smooth (not jarring)

3. **Typography**:
   - Line-height ≥ 1.5 for body text
   - Font size ≥ 16px for mobile
   - Letter-spacing adequate for dyslexia-friendly reading

4. **Keyboard Navigation**:
   - All interactive elements are focusable
   - Tab order is logical
   - Focus indicators are visible

---

## 🚀 Performance Optimization

1. **Glassmorphism**: Uses `backdrop-filter: blur()` (supported by 95% of browsers)
2. **Gradient Blobs**: CSS-only (no images)
3. **Animations**: CSS-based (not JavaScript-heavy)
4. **Dark Mode**: Supported via Tailwind's `dark:` prefix

---

## 📚 Implementation Notes

### Global Animations (Applied via useEffect)

Located in `src/components/LandingPage/LandingPage.tsx`:

- `.float-animation` - Continuous float effect
- `.slide-up-animation` - Entrance animation
- `.fade-in-animation` - Opacity transition
- `.pulse-glow` - Pulsing glow effect

### Tailwind Customization

- Extended color palette in `tailwind.config.js`
- Custom animation timings
- Backdrop blur effects

### Browser Compatibility

- Modern CSS: `backdrop-filter`, `mix-blend-multiply`, CSS Grid
- All major browsers supported (Chrome, Firefox, Safari, Edge)
- IE 11: Graceful degradation (no blur effects)

---

## 🎯 Conversion Optimization Tips

1. **Above the Fold**:
   - Clear headline promise
   - One primary CTA in hero
   - Value proposition visible without scrolling

2. **Social Proof**:
   - University names create trust
   - "50,000+ students" creates FOMO
   - Student testimonials later on page

3. **Clear Value Props**:
   - Each feature clearly states benefit
   - Icon + title + description + bullet points

4. **Call-to-Action Hierarchy**:
   - Primary: Blue gradient, prominent
   - Secondary: Outline, less prominent
   - Tertiary: Text links

5. **Trust Signals**:
   - Dashboard preview (shows real product)
   - Performance metrics
   - Comparison to peers

---

## 📊 Design Tokens Summary

| Token                | Value                       | Usage                         |
| -------------------- | --------------------------- | ----------------------------- |
| `--primary`          | #2563EB                     | Primary buttons, links, icons |
| `--accent-purple`    | #7C3AED                     | Secondary, emphasis           |
| `--success`          | #10B981                     | Progress, positive            |
| `--warning`          | #FB923C                     | Alerts, important             |
| `--border-radius-lg` | 24px                        | Major containers              |
| `--shadow-lg`        | 0 10px 25px rgba(0,0,0,0.1) | Elevation                     |

---

**Created**: 2026-04-15  
**Version**: 1.0  
**Last Updated**: 2026-04-15
