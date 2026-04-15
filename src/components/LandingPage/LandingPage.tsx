import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeLanguageToggle } from "@/components/common/ThemeLanguageToggle";
import { useTheme } from "@/core/theme/ThemeContext";
import { useLanguage } from "@/core/language/LanguageContext";
import { getTranslation } from "@/core/language/translations";
import brainLogo from "/FasitiLogo-bg.png";
import {
  BookOpen,
  BarChart3,
  Trophy,
  Brain,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Users,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const floatingVariants = {
  float: {
    y: [0, -10, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity },
  },
};

const LandingPage = () => {
  const { theme } = useTheme();
  const { language, dir } = useLanguage();
  const t = getTranslation(language);
  const isRTL = dir === "rtl";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const navFooterLogoHeightSize = 50;
  const navFooterLogoWidthSize = 45;

  return (
    <div
      className={`min-h-screen bg-background transition-colors duration-300 flex flex-col ${isRTL ? "rtl" : "ltr"}`}
      dir={dir}
    >
      {/* Navigation */}
      <motion.header
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-colors duration-300 px-3 sm:px-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <motion.img
              src={brainLogo}
              alt="Fasiti logo"
              className="shrink-0"
              style={{
                height: navFooterLogoHeightSize,
                width: navFooterLogoWidthSize,
              }}
              animate={{ rotateZ: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <h1
              className={`text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent`}
            >
              Fasiti
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {[
              { label: t.nav.features, href: "#features" },
              { label: t.nav.howItWorks, href: "#how-it-works" },
              { label: t.nav.reviews, href: "#reviews" },
            ].map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeLanguageToggle />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block"
            >
              <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                <Link to="/signin">{t.nav.signin}</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block"
            >
              <Button size="sm" className="text-xs md:text-sm">
                <Link to="/signup">{t.nav.signup}</Link>
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: mobileMenuOpen ? 1 : 0,
            height: mobileMenuOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden border-t bg-background"
        >
          <div className="container py-4 space-y-3">
            {[
              { label: t.nav.features, href: "#features" },
              { label: t.nav.howItWorks, href: "#how-it-works" },
              { label: t.nav.reviews, href: "#reviews" },
            ].map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium py-2 hover:text-primary transition-colors"
                whileHover={{ x: 5 }}
              >
                {item.label}
              </motion.a>
            ))}
            <div className="border-t pt-3 space-y-2">
              <Link to="/signin" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  {t.nav.signin}
                </Button>
              </Link>
              <Link to="/signup" className="block">
                <Button className="w-full justify-start text-sm">
                  {t.nav.signup}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-40 right-10 w-72 h-72 bg-blue-300 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
              transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-3 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-center">
              <motion.div
                variants={itemVariants}
                className={isRTL ? "text-right" : ""}
              >
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
                  variants={itemVariants}
                >
                  {t.hero.title}
                </motion.h1>
                <motion.p
                  className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed"
                  variants={itemVariants}
                >
                  {t.hero.subtitle}
                </motion.p>
                <motion.div
                  className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${isRTL ? "flex-row-reverse sm:flex-row-reverse justify-end" : ""}`}
                  variants={itemVariants}
                >
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm sm:text-base"
                  >
                    <Link to="/signup" className="flex items-center gap-2">
                      {t.hero.cta}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-sm sm:text-base"
                  >
                    <Link to="/signin">{t.hero.startLearning}</Link>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <motion.div animate="float" variants={floatingVariants}>
                  <div className="relative w-full h-64 sm:h-80 md:h-96">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 dark:from-purple-500/10 dark:to-blue-500/10 rounded-3xl"
                      animate="pulse"
                      variants={pulseVariants}
                    />
                    <div className="absolute inset-4 bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                      <Brain className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 text-white" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/30 dark:bg-muted/10 transition-colors duration-300"
          id="features"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <motion.div
              className={`text-center mb-12 sm:mb-14 md:mb-16 ${isRTL ? "text-right" : ""}`}
              variants={itemVariants}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                {t.features.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                {t.features.subtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {[
                {
                  icon: Brain,
                  title: t.features.aiTutor.title,
                  desc: t.features.aiTutor.description,
                },
                {
                  icon: Zap,
                  title: t.features.smartPath.title,
                  desc: t.features.smartPath.description,
                },
                {
                  icon: BookOpen,
                  title: t.features.practiceTests.title,
                  desc: t.features.practiceTests.description,
                },
                {
                  icon: BarChart3,
                  title: t.features.tracking.title,
                  desc: t.features.tracking.description,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-4 sm:p-5 md:p-6 rounded-xl bg-background border border-border hover:border-primary hover:shadow-lg transition-all duration-300 dark:hover:shadow-purple-900/20"
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <motion.div
                    className="mb-3 sm:mb-4 inline-block p-2 sm:p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          className="py-12 sm:py-16 md:py-20 lg:py-24"
          id="how-it-works"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <motion.div
              className={`text-center mb-12 sm:mb-14 md:mb-16 ${isRTL ? "text-right" : ""}`}
              variants={itemVariants}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                {t.howItWorks.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                {t.howItWorks.subtitle}
              </p>
            </motion.div>

            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8 ${isRTL ? "direction-rtl" : ""}`}
            >
              {[
                {
                  icon: CheckCircle,
                  title: t.howItWorks.step1.title,
                  desc: t.howItWorks.step1.description,
                  num: "01",
                },
                {
                  icon: BookOpen,
                  title: t.howItWorks.step2.title,
                  desc: t.howItWorks.step2.description,
                  num: "02",
                },
                {
                  icon: Trophy,
                  title: t.howItWorks.step3.title,
                  desc: t.howItWorks.step3.description,
                  num: "03",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  variants={itemVariants}
                >
                  <div className="p-5 sm:p-6 md:p-8 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 h-full">
                    <motion.div
                      className="text-5xl sm:text-6xl font-bold text-purple-200 dark:text-purple-900/30 mb-3 sm:mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index,
                      }}
                    >
                      {step.num}
                    </motion.div>
                    <motion.div
                      className="inline-block p-2 sm:p-3 bg-background rounded-lg mb-3 sm:mb-4"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <step.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                    </motion.div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                  {index < 2 && (
                    <motion.div
                      className="absolute top-1/2 -right-4 transform -translate-y-1/2 hidden md:block"
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Reviews Section */}
        <motion.section
          className="py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/30 dark:bg-muted/10 transition-colors duration-300"
          id="reviews"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <motion.div
              className={`text-center mb-12 sm:mb-14 md:mb-16 ${isRTL ? "text-right" : ""}`}
              variants={itemVariants}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                {t.reviews.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                {t.reviews.subtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {[
                {
                  name: "Chioma Okonkwo",
                  field: "Medicine, UNILAG",
                  rating: 5,
                  text: "Fasiti transformed my preparation! I went from 220 to 298. The AI explanations are incredibly detailed.",
                  initials: "CO",
                },
                {
                  name: "Emeka Eze",
                  field: "Engineering, UNIBEN",
                  rating: 5,
                  text: "The practice tests feel so real. It's like having a personal tutor available 24/7. Worth every naira!",
                  initials: "EE",
                },
                {
                  name: "Tunde Bakare",
                  field: "Economics, OAU",
                  rating: 5,
                  text: "The leaderboard kept me motivated. Watching my rank improve each week was amazing. Highly recommended!",
                  initials: "TB",
                },
                {
                  name: "Ngozi Obi",
                  field: "Law, UI",
                  rating: 5,
                  text: "I impressed my parents with my UTME score. Fasiti's personalized study paths work like magic!",
                  initials: "NO",
                },
                {
                  name: "Yusuf Ibrahim",
                  field: "Medicine, ABU",
                  rating: 5,
                  text: "The analytics dashboard helped me identify weak areas quickly. I improved my score by 85 points!",
                  initials: "YI",
                },
                {
                  name: "Amina Hassan",
                  field: "Pharmacy, OAU",
                  rating: 5,
                  text: "Best investment in my future! The AI explanations are better than my expensive private tutors.",
                  initials: "AH",
                },
              ].map((review, index) => (
                <motion.div
                  key={index}
                  className="p-4 sm:p-5 md:p-6 rounded-xl bg-background border border-border hover:border-primary hover:shadow-lg transition-all duration-300 dark:hover:shadow-purple-900/20 flex flex-col"
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.2 }}>
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 flex-grow">
                    "{review.text}"
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {review.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm break-words">
                        {review.name}
                      </p>
                      <p className="text-xs text-muted-foreground break-words">
                        {review.field}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="py-12 sm:py-16 md:py-20 lg:py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <motion.div
              className="text-center mb-8 sm:mb-10 md:mb-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 md:mb-4"
                variants={itemVariants}
              >
                {t.faqs.title}
              </motion.h2>
              <motion.p
                className="text-base sm:text-lg md:text-xl text-muted-foreground"
                variants={itemVariants}
              >
                {t.faqs.subtitle}
              </motion.p>
            </motion.div>

            <motion.div
              className="max-w-2xl mx-auto space-y-2 sm:space-y-3 md:space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {t.faqs.questions.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
                  variants={itemVariants}
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === idx ? null : idx)
                    }
                    className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors gap-3"
                  >
                    <span className="font-semibold text-foreground text-sm sm:text-base md:text-lg break-words">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedFAQ === idx ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </motion.div>
                  </button>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: expandedFAQ === idx ? "auto" : 0,
                      opacity: expandedFAQ === idx ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-background text-muted-foreground border-t border-border text-xs sm:text-sm md:text-base">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900 text-white relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <div
            className={`max-w-7xl mx-auto px-3 sm:px-6 relative z-10 text-center ${isRTL ? "rtl" : ""}`}
          >
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
              variants={itemVariants}
            >
              {t.cta.title}
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg md:text-xl text-purple-100 dark:text-purple-200 mb-6 sm:mb-8"
              variants={itemVariants}
            >
              {t.cta.subtitle}
            </motion.p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="bg-white text-purple-600 hover:bg-purple-50 dark:bg-purple-950 dark:text-purple-100 text-sm sm:text-base"
              >
                <Link to="/signup" className="flex items-center gap-2">
                  {t.cta.button}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
        {/* Footer Spacer */}
        <div className="h-2 sm:h-3 md:h-4"></div>
      </main>

      {/* Footer */}
      <motion.footer
        className="bg-background border-t transition-colors duration-300 z-20 relative shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -50px 0px" }}
        transition={{ duration: 0.4 }}
      >
        {/* Main Footer Content */}
        <div className="py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-10 ${isRTL ? "rtl" : "ltr"}`}
            >
              {/* Brand Column */}
              <motion.div
                className="lg:col-span-1 sm:col-span-2"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <img
                    src={brainLogo}
                    alt="Fasiti logo"
                    className="shrink-0"
                    style={{
                      height: navFooterLogoHeightSize,
                      width: navFooterLogoWidthSize,
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Fasiti
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {t.footer.tagline}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                  The ultimate UTME preparation platform powered by AI and
                  data-driven insights.
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3 h-3 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <a
                      href="mailto:support@fasiti.io"
                      className="text-muted-foreground hover:text-primary transition-colors truncate text-xs"
                    >
                      {t.footer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3 h-3 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <a
                      href="tel:+234123456789"
                      className="text-muted-foreground hover:text-primary transition-colors text-xs"
                    >
                      {t.footer.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground line-clamp-2 text-xs">
                      {t.footer.address}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Company Links */}
              <motion.div variants={itemVariants}>
                <h4 className="font-semibold mb-2 sm:mb-3 text-foreground text-xs sm:text-sm">
                  {t.footer.company}
                </h4>
                <ul className="space-y-1 sm:space-y-2">
                  {[
                    { label: t.footer.home, href: "/" },
                    { label: t.footer.features, href: "#features" },
                    { label: t.footer.dashboard, href: "/dashboard" },
                  ].map((link, idx) => (
                    <motion.li key={idx} whileHover={{ x: 5 }}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-xs"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Resources */}
              <motion.div variants={itemVariants}>
                <h4 className="font-semibold mb-2 sm:mb-3 text-foreground text-xs sm:text-sm">
                  {t.footer.resources}
                </h4>
                <ul className="space-y-1 sm:space-y-2">
                  {[
                    { label: "Blog", href: "/blog" },
                    { label: "Help Center", href: "/help" },
                    { label: "Community", href: "/community" },
                  ].map((link, idx) => (
                    <motion.li key={idx} whileHover={{ x: 5 }}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-xs"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Legal */}
              <motion.div variants={itemVariants}>
                <h4 className="font-semibold mb-2 sm:mb-3 text-foreground text-xs sm:text-sm">
                  {t.footer.legal}
                </h4>
                <ul className="space-y-1 sm:space-y-2">
                  {[
                    { label: t.footer.privacy, href: "/privacy" },
                    { label: t.footer.terms, href: "/terms" },
                    { label: t.footer.contact, href: "/contact" },
                  ].map((link, idx) => (
                    <motion.li key={idx} whileHover={{ x: 5 }}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-xs"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Social Media */}
              <motion.div variants={itemVariants}>
                <h4 className="font-semibold mb-2 sm:mb-3 text-foreground text-xs sm:text-sm">
                  {t.footer.followUs}
                </h4>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {[
                    {
                      icon: Facebook,
                      label: "Facebook",
                      href: "https://facebook.com",
                    },
                    {
                      icon: Twitter,
                      label: "Twitter",
                      href: "https://twitter.com",
                    },
                    {
                      icon: Linkedin,
                      label: "LinkedIn",
                      href: "https://linkedin.com",
                    },
                  ].map((social, idx) => (
                    <motion.a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 sm:p-1.5 rounded-lg bg-muted hover:bg-purple-100 dark:hover:bg-purple-900/30 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title={social.label}
                    >
                      <social.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Divider */}
            <motion.div
              className="border-t border-border my-3 sm:my-4 md:my-5 lg:my-6"
              variants={itemVariants}
            />

            {/* Bottom Footer */}
            <motion.div
              className={`flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 text-center ${isRTL ? "sm:text-right sm:flex-row-reverse" : ""}`}
              variants={itemVariants}
            >
              <p className="text-xs text-muted-foreground line-clamp-1">
                {t.footer.copyright}
              </p>
              <div className="flex gap-2 sm:gap-3">
                <a
                  href="#"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Status
                </a>
                <a
                  href="#"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Changelog
                </a>
                <a
                  href="#"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Sitemap
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
