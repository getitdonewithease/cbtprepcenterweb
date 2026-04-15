import React from "react";
import { useLanguage } from "@/core/language/LanguageContext";
import { getTranslation } from "@/core/language/translations";
import { useTheme } from "@/core/theme/ThemeContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const { language, dir } = useLanguage();
  const { theme } = useTheme();
  const t = getTranslation(language);
  const isRTL = dir === "rtl";

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

  return (
    <div
      className={`min-h-screen bg-background transition-colors duration-300 ${isRTL ? "rtl" : "ltr"}`}
      dir={dir}
    >
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>back</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <motion.main
        className="container py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="max-w-3xl" variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.pages.privacy.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t.pages.privacy.lastUpdated}
          </p>
          <p className="text-lg text-muted-foreground mb-12">
            {t.pages.privacy.intro}
          </p>

          <div className="space-y-8">
            {[
              {
                title: "Information We Collect",
                content:
                  "We collect information you provide directly, such as when you create an account, take a test, or contact us. This includes your name, email, phone number, and academic information. We also automatically collect certain information about your device and how you interact with our platform.",
              },
              {
                title: "How We Use Your Information",
                content:
                  "We use your information to provide and improve our services, personalize your learning experience, process transactions, and send you updates about Fasiti. We also use it to develop new features and analyze how users interact with our platform.",
              },
              {
                title: "Data Security",
                content:
                  "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no security system is impenetrable.",
              },
              {
                title: "Your Rights",
                content:
                  "You have the right to access, correct, or delete your personal data. You can also opt-out of marketing communications at any time. To exercise these rights, please contact us at support@fasiti.io.",
              },
              {
                title: "Contact Us",
                content:
                  "If you have questions about this Privacy Policy, please contact us at support@fasiti.io or call +234 (0) 123 456 7890.",
              },
            ].map((section, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default PrivacyPolicy;
