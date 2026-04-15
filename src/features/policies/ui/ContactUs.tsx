import React from "react";
import { useLanguage } from "@/core/language/LanguageContext";
import { getTranslation } from "@/core/language/translations";
import { useTheme } from "@/core/theme/ThemeContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactUs = () => {
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
            {t.pages.contact.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            {t.pages.contact.subtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: Mail,
                label: t.pages.contact.emailLabel,
                value: t.pages.contact.email,
                href: `mailto:${t.pages.contact.email}`,
              },
              {
                icon: Phone,
                label: t.pages.contact.phoneLabel,
                value: t.pages.contact.phone,
                href: `tel:${t.pages.contact.phone.replace(/\s/g, "")}`,
              },
            ].map((item, idx) => (
              <motion.a
                key={idx}
                href={item.href}
                className="p-6 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                variants={itemVariants}
              >
                <div className="flex items-start gap-4">
                  <item.icon className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">{item.label}</h3>
                    <p className="text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div
            className="p-6 bg-muted rounded-lg mb-8"
            variants={itemVariants}
          >
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">
                  {t.pages.contact.addressLabel}
                </h3>
                <p className="text-muted-foreground">
                  {t.pages.contact.address}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.p
            className="text-muted-foreground mb-8"
            variants={itemVariants}
          >
            {t.pages.contact.message}
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default ContactUs;
