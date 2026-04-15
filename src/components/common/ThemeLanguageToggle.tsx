import React from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "@/core/theme/ThemeContext";
import { useLanguage, Language } from "@/core/language/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const languages: { value: Language; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "ha", label: "Hausa", flag: "🇳🇬" },
  { value: "ig", label: "Igbo", flag: "🇳🇬" },
  { value: "yo", label: "Yoruba", flag: "🇳🇬" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
];

export const ThemeLanguageToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      {/* Theme Toggle */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full hover:bg-primary/10 dark:hover:bg-primary/20"
          title={
            theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
          }
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </motion.div>

      {/* Language Select */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="min-w-fit"
      >
        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as Language)}
        >
          <SelectTrigger className="w-fit gap-2 rounded-full border px-3 py-2 text-sm">
            <Globe className="h-4 w-4" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
    </div>
  );
};
