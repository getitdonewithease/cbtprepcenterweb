# Fasiti - Framer Motion Upgrade Guide

## Overview

This guide provides Framer Motion implementations for enhancing the landing page animations beyond basic CSS.

### When to Use Framer Motion vs CSS

| Scenario                    | CSS | Framer Motion |
| --------------------------- | --- | ------------- |
| Simple hover effects        | ✓   | ✗             |
| Page load animations        | ✓   | ✓ Better      |
| Scroll-triggered animations | ✗   | ✓             |
| Staggered child animations  | ✓   | ✓ Easier      |
| Complex sequences           | ✗   | ✓             |
| Performance critical        | ✓   | ✗             |

---

## Installation

```bash
npm install framer-motion
```

Update component imports:

```tsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
```

---

## 1. Enhanced Hero Section Animation

### Current (CSS): Simple slide-up

### Upgraded (Framer Motion): Coordinated sequence with stagger

```tsx
import { motion } from "framer-motion";

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-6"
    >
      {/* Badge */}
      <motion.div variants={childVariants}>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Zap className="h-4 w-4" />
          The Future of UTME Preparation
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1 variants={childVariants} className="text-6xl font-bold">
        Transform Your UTME Strategy
      </motion.h1>

      {/* Subheading */}
      <motion.p
        variants={childVariants}
        className="text-xl text-muted-foreground"
      >
        Join 50,000+ Nigerian students succeeding on their UTME exams...
      </motion.p>

      {/* Benefits List */}
      <motion.div variants={containerVariants} className="space-y-4">
        {benefits.map((benefit, idx) => (
          <motion.div
            key={idx}
            variants={childVariants}
            className="flex items-center gap-3"
          >
            {/* Benefit content */}
          </motion.div>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div variants={childVariants} className="flex gap-4">
        {/* Buttons */}
      </motion.div>
    </motion.div>
  );
};
```

---

## 2. Dashboard Card Float & Glow Animation

### Current: CSS keyframe float

### Upgraded: Framer Motion with dual animations

```tsx
const DashboardCard = () => {
  const floatVariants = {
    floating: {
      y: [-20, 0, -20],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const glowVariants = {
    glow: {
      boxShadow: [
        "0 0 20px rgba(33, 150, 243, 0.3)",
        "0 0 40px rgba(33, 150, 243, 0.5)",
        "0 0 20px rgba(33, 150, 243, 0.3)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      variants={floatVariants}
      animate="floating"
      className="relative"
    >
      <motion.div
        variants={glowVariants}
        animate="glow"
        className="p-6 rounded-3xl bg-white/20 dark:bg-slate-900/20 backdrop-blur-2xl border border-white/30"
      >
        {/* Dashboard content */}
      </motion.div>
    </motion.div>
  );
};
```

---

## 3. Scroll-Triggered Feature Card Animations

### Current: No scroll trigger

### Upgraded: Enters on scroll + interactive hover

```tsx
const FeatureCard = ({ feature, index }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      rotate: -2,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const hoverVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover="hover"
      variants={{ ...cardVariants, ...hoverVariants }}
      className="group bg-card border rounded-2xl p-7 hover:border-blue-300"
    >
      {/* Card content */}
    </motion.div>
  );
};
```

---

## 4. Icon Rotation on Hover

### Current: Simple scale transform

### Upgraded: Smooth 360° rotation with scale

```tsx
const FeatureIcon = ({ Icon, gradient }) => {
  return (
    <motion.div
      whileHover={{
        rotate: 360,
        scale: 1.1,
        transition: { duration: 0.6, type: "spring" },
      }}
      className={`rounded-xl bg-gradient-to-br ${gradient} p-4 w-fit`}
    >
      <Icon className="h-6 w-6 text-white" />
    </motion.div>
  );
};
```

---

## 5. Staggered Benefit List

### Current: Simple list

### Upgraded: Each item animates in with bounce

```tsx
const BenefitsList = ({ benefits }) => {
  const listVariants = {
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-4"
    >
      {benefits.map((benefit, idx) => (
        <motion.div
          key={idx}
          variants={itemVariants}
          className="flex items-center gap-3"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500" />
          <span className="font-medium">{benefit.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};
```

---

## 6. Progress Bar Animation

### Current: Static width

### Upgraded: Animated fill on scroll view

```tsx
const ProgressBar = ({ subject, score }) => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <div ref={ref} className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span>{subject}</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          {score}%
        </motion.span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${score}%` } : {}}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
        />
      </div>
    </div>
  );
};
```

---

## 7. Counter Animation (Stats)

### For "50,000+ students" stat

```tsx
import { useMotionValue, useTransform, motion } from "framer-motion";

const CounterStat = ({ value, label }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  React.useEffect(() => {
    const animation = animate(count, value, {
      duration: 2.5,
      ease: "easeOut",
    });

    return animation.stop;
  }, [count, value]);

  return (
    <div className="text-center">
      <motion.div className="text-4xl font-bold text-blue-600">
        {rounded}+
      </motion.div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};
```

---

## 8. Page Transition Animation

### For smooth transitions between pages

```tsx
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Usage in LandingPage component
import { AnimatePresence } from "framer-motion";

export const LandingPage = () => (
  <motion.div
    variants={pageTransitionVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {/* Page content */}
  </motion.div>
);
```

---

## 9. Layout Animation (Reorder)

### When layout changes (e.g., responsive breakpoint)

```tsx
<motion.div layout className="grid grid-cols-2 gap-4">
  {items.map((item) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

---

## 10. Gesture Animations (Touch)

### For mobile touch feedback

```tsx
const TouchCard = ({ children }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
};
```

---

## Advanced: Spring Physics

### Understanding Framer Motion spring parameters

```tsx
{
  type: "spring",
  stiffness: 100,    // 0-500: Higher = faster
  damping: 10,       // 0-100: Higher = less bouncy
  mass: 1,           // > 0: Higher = slower acceleration
}

// Presets
- "stiff": { stiffness: 210, damping: 20 }
- "molasses": { stiffness: 50, damping: 25 }
- "wobbly": { stiffness: 180, damping: 12 }
- "bouncy": { stiffness: 300, damping: 10 }
```

---

## Performance Optimization with Framer Motion

### 1. Use `willChange` CSS

```tsx
<motion.div style={{ willChange: "transform" }} />
```

### 2. Lazy load animations

```tsx
const { inView, ref } = useInView({ triggerOnce: true });

if (!inView) return <div ref={ref} />; // Don't animate off-screen
```

### 3. Disable on mobile

```tsx
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const variants = prefersReduced
  ? { visible: {} } // No animation
  : { visible: { y: 0 } }; // Normal animation
```

### 4. Use `layout` sparingly

```tsx
// ❌ Bad: Heavy layout recalculations
<motion.div layout className="...">

// ✅ Good: Use only when needed
<motion.div layout layoutId="unique-id" className="...">
```

---

## Migration Checklist

To upgrade from CSS to Framer Motion:

- [ ] Install Framer Motion: `npm install framer-motion`
- [ ] Wrap with AnimatePresence where needed
- [ ] Convert `.slide-up-animation` to `variants` with stagger
- [ ] Add `useInView` hook for scroll triggers
- [ ] Replace CSS keyframes with motion variants
- [ ] Test on mobile (verify performance)
- [ ] Ensure animations respect `prefers-reduced-motion`
- [ ] Update documentation

---

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Best Practices](https://www.smashingmagazine.com/2021/09/animation-react-framer-motion/)
- [Spring Physics Guide](https://www.framer.com/docs/animation/#spring)

---

**Version**: 1.0  
**Status**: Ready to implement  
**Suggested Priority**: Phase 2 enhancement
