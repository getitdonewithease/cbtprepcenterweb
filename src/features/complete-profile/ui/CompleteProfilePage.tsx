import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  BookOpen,
  Target,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useCompleteProfile } from "../hooks/useCompleteProfile";
import { AvatarDialog } from "./AvatarDialog";
import {
  DEPARTMENTS,
  departmentSubjects,
  ALL_SUBJECTS,
  NIGERIAN_UNIVERSITIES,
  POPULAR_COURSES,
  STUDY_HOURS,
} from "../data/constants";
import { useUserContext } from "@/features/dashboard";

const orange = "hsl(var(--brand-orange))";

const STEPS = [
  { id: 1, title: "Identity & Track", subtitle: "Tell us who you are and your field of study", icon: GraduationCap },
  { id: 2, title: "UTME Subjects", subtitle: "Choose your 4 core exam subjects", icon: BookOpen },
  { id: 3, title: "Target & Habit", subtitle: "Set your academic goals and study pace", icon: Target },
];

export const CompleteProfilePage: React.FC = () => {
  const { refetchUser } = useUserContext();
  const {
    form,
    step,
    direction,
    isFetching,
    isSubmitting,
    error,
    setError,
    updateField,
    selectDepartment,
    toggleSubject,
    toggleWeakSubject,
    isStepValid,
    goForward,
    goBack,
    handleSubmit,
  } = useCompleteProfile({
    onSuccessRedirect: "/dashboard",
    onRefetchUser: refetchUser,
  });

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const selectedDeptSubjects = form.department && departmentSubjects[form.department]
    ? departmentSubjects[form.department]
    : [];

  const initials = form.firstName && form.lastName
    ? `${form.firstName[0]}${form.lastName[0]}`.toUpperCase()
    : form.firstName
      ? form.firstName[0].toUpperCase()
      : form.email
        ? form.email[0].toUpperCase()
        : "U";

  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-muted border-t-[hsl(var(--brand-orange))] animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative bg-background overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[140px] opacity-15"
        style={{ backgroundColor: "hsl(25 95% 53%)" }}
      />

      <div className="w-full max-w-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-card/60 backdrop-blur-sm mb-4">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: orange }} />
            <span className="text-xs font-bold tracking-tight text-foreground">Fasiti Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Personalize your study experience so we can tailor practice tests, recommendations, and analytics specifically for you.
          </p>
        </div>

        {/* Stepper Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden backdrop-blur-sm">
          {/* Progress bar and step indicator */}
          <div className="border-b border-border/70 bg-muted/20 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: orange }}>
                Step {step} of 3 — {STEPS[step - 1].title}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {step === 1 && "Basic Information"}
                {step === 2 && `${form.selectedSubjects.length}/4 Subjects Selected`}
                {step === 3 && "Almost Done!"}
              </span>
            </div>

            {/* Segmented progress bar */}
            <div className="grid grid-cols-3 gap-2">
              {STEPS.map(s => {
                const isCompleted = s.id < step;
                const isCurrent = s.id === step;
                return (
                  <div key={s.id} className="space-y-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: isCompleted || isCurrent ? orange : "hsl(var(--muted))",
                        opacity: isCurrent ? 1 : isCompleted ? 0.7 : 0.4,
                      }}
                    />
                    <p className="hidden sm:block text-[11px] font-medium truncate text-muted-foreground">
                      {s.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8">
            {error && (
              <SectionAlertBanner
                description={error}
                onDismiss={() => setError("")}
                className="mb-6"
              />
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={{
                  enter: (d: string) => ({ opacity: 0, x: d === "forward" ? 20 : -20 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: string) => ({ opacity: 0, x: d === "forward" ? -20 : 20 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                {/* ════ Step 1: Identity & Track ════ */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Welcome! What should we call you?</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Confirm your name and avatar, then pick your academic track.
                      </p>
                    </div>

                    {/* Avatar row */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
                      <Avatar className="h-16 w-16 shrink-0 ring-2 ring-[hsl(var(--brand-orange))]/30">
                        <AvatarImage src={form.avatar || undefined} alt={form.firstName} />
                        <AvatarFallback className="text-base font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {form.firstName ? `${form.firstName} ${form.lastName}`.trim() : "Your Name"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{form.email}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setAvatarDialogOpen(true)}
                          className="mt-2 h-7 text-xs"
                        >
                          Change Avatar
                        </Button>
                      </div>
                    </div>

                    <AvatarDialog
                      isOpen={avatarDialogOpen}
                      onClose={() => setAvatarDialogOpen(false)}
                      currentAvatar={form.avatar}
                      onAvatarSelect={url => {
                        updateField("avatar", url);
                        setAvatarDialogOpen(false);
                      }}
                    />

                    {/* Name inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="firstName"
                          placeholder="e.g. Samuel"
                          value={form.firstName}
                          onChange={e => updateField("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="e.g. Adebayo"
                          value={form.lastName}
                          onChange={e => updateField("lastName", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Department selection */}
                    <div className="space-y-3">
                      <Label>Choose your Department / Track <span className="text-destructive">*</span></Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {DEPARTMENTS.map(dept => {
                          const isSelected = form.department === dept.value;
                          return (
                            <button
                              key={dept.value}
                              type="button"
                              onClick={() => selectDepartment(dept.value)}
                              className={[
                                "p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between",
                                isSelected
                                  ? "border-[hsl(var(--brand-orange))] bg-[hsl(25,95%,53%)]/[0.08] shadow-sm"
                                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30",
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-bold text-foreground">{dept.label}</span>
                                {isSelected && (
                                  <div className="h-4 w-4 rounded-full bg-[hsl(var(--brand-orange))] flex items-center justify-center">
                                    <Check className="h-2.5 w-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-snug">
                                {dept.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════ Step 2: UTME Subjects ════ */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Pick your 4 UTME Subjects</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          English is compulsory for all candidates. Select 3 other subjects.
                        </p>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-semibold shrink-0"
                        style={{
                          backgroundColor: form.selectedSubjects.length === 4
                            ? "hsl(25 95% 53% / 0.15)"
                            : "hsl(var(--muted))",
                          color: form.selectedSubjects.length === 4
                            ? orange
                            : "hsl(var(--muted-foreground))",
                        }}
                      >
                        {form.selectedSubjects.length === 4
                          ? "✓ All 4 selected"
                          : `${form.selectedSubjects.length}/4 subjects`}
                      </div>
                    </div>

                    {form.department && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" style={{ color: orange }} />
                        <span>Recommended for <strong>{form.department}</strong> students:</span>
                      </div>
                    )}

                    {/* Subject Pills */}
                    <div className="flex flex-wrap gap-2.5">
                      {ALL_SUBJECTS.map(subject => {
                        const isEnglish = subject.value === "english";
                        const isSelected = form.selectedSubjects.includes(subject.value);
                        const isRecommended = selectedDeptSubjects.includes(subject.value);
                        const disabled = !isSelected && form.selectedSubjects.length >= 4;

                        return (
                          <button
                            key={subject.value}
                            type="button"
                            onClick={() => toggleSubject(subject.value)}
                            disabled={disabled || isEnglish}
                            className={[
                              "rounded-full border px-3.5 py-1.5 text-sm transition-all flex items-center gap-1.5",
                              disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                            ].join(" ")}
                            style={
                              isSelected
                                ? {
                                    borderColor: orange,
                                    backgroundColor: "hsl(25 95% 53% / 0.14)",
                                    color: "hsl(var(--foreground))",
                                    fontWeight: 600,
                                  }
                                : isRecommended
                                  ? {
                                      borderColor: "hsl(25 95% 53% / 0.35)",
                                      backgroundColor: "hsl(25 95% 53% / 0.04)",
                                      color: "hsl(var(--foreground))",
                                    }
                                  : {
                                      borderColor: "hsl(var(--border))",
                                      color: "hsl(var(--muted-foreground))",
                                    }
                            }
                          >
                            <span>{subject.label}</span>
                            {isEnglish && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground">
                                Compulsory
                              </span>
                            )}
                            {isSelected && !isEnglish && (
                              <Check className="h-3.5 w-3.5" style={{ color: orange }} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Optional Weak Subjects */}
                    {form.selectedSubjects.length === 4 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2.5"
                      >
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Which subject do you find most challenging? <span className="font-normal">(Optional)</span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {form.selectedSubjects.map(subVal => {
                            const match = ALL_SUBJECTS.find(s => s.value === subVal);
                            const isWeak = form.weakSubjects.includes(subVal);
                            return (
                              <button
                                key={subVal}
                                type="button"
                                onClick={() => toggleWeakSubject(subVal)}
                                className="rounded-full border px-3 py-1 text-xs transition-all"
                                style={
                                  isWeak
                                    ? {
                                        borderColor: orange,
                                        backgroundColor: "hsl(25 95% 53% / 0.15)",
                                        color: "hsl(var(--foreground))",
                                        fontWeight: 600,
                                      }
                                    : {
                                        borderColor: "hsl(var(--border))",
                                        color: "hsl(var(--muted-foreground))",
                                      }
                                }
                              >
                                {match?.label ?? subVal}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ════ Step 3: Target & Habit ════ */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Your Academic Goals</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Help us tailor recommendations and track your progress toward your dream institution.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* University of Choice */}
                      <div className="space-y-2">
                        <Label>Target Institution</Label>
                        <Select
                          value={form.universityOfChoice}
                          onValueChange={v => updateField("universityOfChoice", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select target university" />
                          </SelectTrigger>
                          <SelectContent>
                            {NIGERIAN_UNIVERSITIES.map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Course of Choice */}
                      <div className="space-y-2">
                        <Label>Desired Course of Study</Label>
                        <Select
                          value={form.courseOfChoice}
                          onValueChange={v => updateField("courseOfChoice", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your preferred course" />
                          </SelectTrigger>
                          <SelectContent>
                            {POPULAR_COURSES.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Target Score & Study Hours */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="targetScore">Target UTME Score</Label>
                          <Input
                            id="targetScore"
                            type="number"
                            min={100}
                            max={400}
                            placeholder="e.g. 280"
                            value={form.targetScore || ""}
                            onChange={e => updateField("targetScore", parseInt(e.target.value) || 0)}
                          />
                          <p className="text-[11px] text-muted-foreground">Aim high! UTME is out of 400.</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Daily Study Commitment</Label>
                          <Select
                            value={String(form.studyHoursPerDay)}
                            onValueChange={v => updateField("studyHoursPerDay", parseInt(v) || 2)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select daily hours" />
                            </SelectTrigger>
                            <SelectContent>
                              {STUDY_HOURS.map(h => (
                                <SelectItem key={h} value={h}>
                                  {h} hour{h === "1" ? "" : "s"} per day
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-muted-foreground">Consistent daily practice yields best results.</p>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="space-y-2">
                        <Label>Have you taken UTME before?</Label>
                        <Select
                          value={String(form.numberOfUTMEWritten)}
                          onValueChange={v => updateField("numberOfUTMEWritten", parseInt(v) || 0)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">This will be my first time</SelectItem>
                            <SelectItem value="1">I have taken it once</SelectItem>
                            <SelectItem value="2">Twice</SelectItem>
                            <SelectItem value="3">Three or more times</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card Footer Navigation */}
          <div className="border-t border-border/70 bg-muted/10 p-5 sm:p-6 flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={goForward}
                disabled={!isStepValid(step) || isSubmitting}
                className="flex items-center gap-1.5 text-white"
                style={{ backgroundColor: orange }}
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 text-white px-6"
                style={{ backgroundColor: orange }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    Finish & Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
