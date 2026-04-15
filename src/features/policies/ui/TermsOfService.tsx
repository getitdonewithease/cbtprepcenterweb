import React from "react";
import { useLanguage } from "@/core/language/LanguageContext";
import { getTranslation } from "@/core/language/translations";
import { useTheme } from "@/core/theme/ThemeContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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
            {t.pages.terms.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t.pages.terms.lastUpdated}
          </p>
          <p className="text-lg text-muted-foreground mb-12">
            {t.pages.terms.intro}
          </p>

          <div className="space-y-8">
            {[
              {
                title: "License to Use",
                content:
                  "Fasiti grants you a limited, non-exclusive, non-transferable license to use our platform for personal, educational purposes only. You may not reproduce, distribute, or transmit any content without our prior written permission.",
              },
              {
                title: "User Responsibilities",
                content:
                  "You agree to use Fasiti only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the platform. Prohibited behavior includes harassment, causing loss, or damage.",
              },
              {
                title: "Intellectual Property",
                content:
                  "All content on Fasiti, including text, graphics, logos, and images, is the property of Fasiti or its content suppliers and is protected by copyright laws. You may not use this content without our permission.",
              },
              {
                title: "Disclaimer",
                content:
                  "Fasiti is provided 'as is' without warranties of any kind, either expressed or implied. We do not warrant that the service will be uninterrupted or error-free.",
              },
              {
                title: "Limitation of Liability",
                content:
                  "In no event shall Fasiti be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.",
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

export default TermsOfService;
