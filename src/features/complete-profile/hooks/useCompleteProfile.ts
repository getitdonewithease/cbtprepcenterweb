import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CompleteProfileFormState } from "../types/completeProfileTypes";
import { completeProfileService } from "../service/completeProfileService";
import { notify } from "@/core/notifications/notify";

interface UseCompleteProfileOptions {
  onSuccessRedirect?: string;
  onRefetchUser?: () => Promise<void>;
}

export function useCompleteProfile({
  onSuccessRedirect = "/dashboard",
  onRefetchUser,
}: UseCompleteProfileOptions = {}) {
  const navigate = useNavigate();

  const [form, setForm] = useState<CompleteProfileFormState>({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    department: "",
    examType: "utme",
    selectedSubjects: ["english"],
    weakSubjects: [],
    universityOfChoice: "",
    courseOfChoice: "",
    numberOfUTMEWritten: 0,
    targetScore: 250,
    studyHoursPerDay: 4,
  });

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsFetching(true);
      const profile = await completeProfileService.loadInitialProfile();
      if (!isMounted) return;

      if (profile) {
        setForm(prev => {
          let existingCourses = Array.isArray(profile.courses)
            ? profile.courses.map(c => c.toLowerCase())
            : [];

          if (!existingCourses.includes("english")) {
            existingCourses = ["english", ...existingCourses];
          }

          return {
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
            email: profile.email || prev.email,
            avatar: profile.avatar || prev.avatar,
            department: profile.department || prev.department,
            selectedSubjects: existingCourses.length > 1 ? existingCourses.slice(0, 4) : ["english"],
          };
        });
      }
      setIsFetching(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = useCallback(<K extends keyof CompleteProfileFormState>(
    key: K,
    value: CompleteProfileFormState[K]
  ) => {
    setError("");
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const selectDepartment = useCallback((dept: string) => {
    setError("");
    setForm(prev => ({ ...prev, department: dept }));
  }, []);

  const toggleSubject = useCallback((subject: string) => {
    const norm = subject.toLowerCase();
    if (norm === "english") return; // English is compulsory

    setError("");
    setForm(prev => {
      const isSelected = prev.selectedSubjects.includes(norm);
      if (isSelected) {
        return {
          ...prev,
          selectedSubjects: prev.selectedSubjects.filter(s => s !== norm),
          weakSubjects: prev.weakSubjects.filter(s => s !== norm),
        };
      }

      if (prev.selectedSubjects.length >= 4) {
        return prev;
      }

      return {
        ...prev,
        selectedSubjects: [...prev.selectedSubjects, norm],
      };
    });
  }, []);

  const toggleWeakSubject = useCallback((subject: string) => {
    const norm = subject.toLowerCase();
    setForm(prev => {
      const isWeak = prev.weakSubjects.includes(norm);
      return {
        ...prev,
        weakSubjects: isWeak
          ? prev.weakSubjects.filter(s => s !== norm)
          : [...prev.weakSubjects, norm],
      };
    });
  }, []);

  const isStepValid = useCallback((stepNumber: number): boolean => {
    if (stepNumber === 1) {
      return Boolean(form.firstName.trim() && form.department.trim());
    }
    if (stepNumber === 2) {
      return form.selectedSubjects.length === 4;
    }
    return true;
  }, [form.firstName, form.department, form.selectedSubjects.length]);

  const goForward = useCallback(() => {
    if (!isStepValid(step)) {
      if (step === 1 && !form.firstName.trim()) {
        setError("Please provide your first name to continue.");
      } else if (step === 1 && !form.department.trim()) {
        setError("Please choose your department to continue.");
      } else if (step === 2 && form.selectedSubjects.length !== 4) {
        setError("Please select all 4 UTME subjects before proceeding.");
      }
      return;
    }
    setError("");
    setDirection("forward");
    setStep(s => Math.min(s + 1, 3));
  }, [isStepValid, step, form.firstName, form.department, form.selectedSubjects.length]);

  const goBack = useCallback(() => {
    setError("");
    setDirection("backward");
    setStep(s => Math.max(s - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await completeProfileService.completeProfile(form);

      if (onRefetchUser) {
        try {
          await onRefetchUser();
        } catch {
          // ignore user refetch errors since profile is already saved
        }
      }

      notify.success({
        title: "Profile Completed!",
        description: "Your study profile is all set. Welcome to Fasiti!",
        duration: 4000,
      });

      navigate(onSuccessRedirect, { replace: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save profile. Please try again.";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onRefetchUser, onSuccessRedirect, navigate]);

  return {
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
  };
}
