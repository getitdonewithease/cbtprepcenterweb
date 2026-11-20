import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowLeft, ArrowRight, Check, Lock, Mail, User } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { COMPULSORY_SUBJECT, DEPARTMENTS, departmentSubjects, getSubjectLabel } from "@/features/exams";
import { useAuth } from "../hooks/useAuth";
import type { SignUpData } from "../types/authTypes";
import {
  PASSWORD_MIN_LENGTH,
  SIGN_UP_STEP_FIELDS,
  UTME_ELECTIVE_COUNT,
  signUpSchema,
  type SignUpValues,
} from "../utils/authSchemas";
import {
  AuthErrorBanner,
  AuthField,
  FOCUS_RING,
  OrDivider,
  PanelHeading,
  TextButton,
  primaryButtonClass,
  secondaryButtonClass,
} from "./authUi";

/**
 * Slim sign-up: two steps, then straight into the app.
 *   1. Account: first name, email, password
 *   2. Subjects: stream, Use of English (locked, compulsory) + three more
 * Target score, university, course and study habits were optional before and are sent with
 * the same defaults as when they were skipped; they are no longer asked before the account
 * exists.
 */

const DRAFT_KEY = "fasiti-signup-draft";
type Step = 1 | 2;
type Draft = Partial<Omit<SignUpValues, "password">> & { step?: Step };

const readDraft = (): Draft => {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
};

const writeDraft = (draft: Draft) => {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // The wizard still works without a saved draft
  }
};

const clearDraft = () => {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // nothing to clear
  }
};

const subjectName = (value: string) =>
  value === COMPULSORY_SUBJECT ? "Use of English" : getSubjectLabel(value);

interface SignUpWizardProps {
  onSignIn: () => void;
}

const SignUpWizard = ({ onSignIn }: SignUpWizardProps) => {
  const { isLoading, error, signUp, signUpWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState("");
  const [draft] = useState(readDraft);
  const [step, setStep] = useState<Step>(draft.step === 2 ? 2 : 1);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: draft.firstName ?? "",
      email: draft.email ?? "",
      password: "",
      stream: draft.stream ?? "",
      electives: draft.electives ?? [],
    },
  });

  const [firstName, email, stream, electives, password] = useWatch({
    control,
    name: ["firstName", "email", "stream", "electives", "password"],
  });

  // Keep a draft for this tab session so a refresh or app switch does not lose progress.
  // The password is never stored.
  useEffect(() => {
    writeDraft({ firstName, email, stream, electives, step });
  }, [firstName, email, stream, electives, step]);

  // A returning draft on step 2 has no password: send the user back to step 1 to enter it
  useEffect(() => {
    if (step === 2 && !password) setStep(1);
    // only on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const streamSubjects = stream
    ? (departmentSubjects[stream] ?? []).filter((s) => s !== COMPULSORY_SUBJECT)
    : [];
  const remaining = UTME_ELECTIVE_COUNT - electives.length;

  const chooseStream = (value: string) => {
    setValue("stream", value, { shouldValidate: true });
    // Keep only picks that exist in the new stream
    const allowed = departmentSubjects[value] ?? [];
    setValue(
      "electives",
      electives.filter((s) => allowed.includes(s)),
      { shouldValidate: Boolean(errors.electives) },
    );
  };

  const toggleElective = (value: string) => {
    const next = electives.includes(value)
      ? electives.filter((s) => s !== value)
      : electives.length < UTME_ELECTIVE_COUNT
        ? [...electives, value]
        : electives;
    setValue("electives", next, { shouldValidate: Boolean(errors.electives) });
  };

  const goToSubjects = async () => {
    const isValid = await trigger(SIGN_UP_STEP_FIELDS[1]);
    if (isValid) setStep(2);
  };

  const onSubmit = handleSubmit(async (values) => {
    setGoogleError("");
    const payload: SignUpData = {
      firstName: values.firstName.trim(),
      lastName: "",
      email: values.email.trim(),
      password: values.password,
      examType: "utme",
      department: values.stream,
      courses: [COMPULSORY_SUBJECT, ...values.electives],
      // Optional details, asked later rather than before the account exists
      universityOfChoice: "",
      courseOfChoice: "",
      numberOfUTMEWritten: 0,
      targetScore: 250,
      studyHoursPerDay: 4,
      preferredStudyTime: "",
      weakSubjects: [],
    };
    await signUp(payload, payload.password);
  });

  // The draft only has to survive a refresh (which never unmounts). Once the wizard unmounts,
  // after a successful sign-up or when the user switches to sign in, it is no longer needed.
  useEffect(() => clearDraft, []);

  return (
    <div className="space-y-7">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Step {step} of 2</span>
          <span className="text-muted-foreground">{step === 1 ? "Your account" : "Your subjects"}</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-label="Sign-up progress"
          aria-valuemin={1}
          aria-valuemax={2}
          aria-valuenow={step}
        >
          <div
            className="h-full rounded-full bg-brand-orange transition-[width] duration-300 ease-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      <AuthErrorBanner message={googleError || error} />

      <form
        onSubmit={(event) => {
          if (step === 2) return onSubmit(event);
          event.preventDefault();
          void goToSubjects();
        }}
        noValidate
      >
        {step === 1 ? (
          <div className="space-y-6">
            <PanelHeading
              title="Create your free account"
              subtitle="It takes a minute. Next you'll pick your subjects, then you can start your first mock."
            />

            <div className="flex justify-center">
              <GoogleLogin
                text="signup_with"
                shape="pill"
                width="320"
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    setGoogleError("");
                    await signUpWithGoogle(credentialResponse.credential, "");
                  } else {
                    setGoogleError("Google sign-up didn't work. Try again, or sign up with your email.");
                  }
                }}
                onError={() => setGoogleError("Google sign-up didn't work. Try again, or sign up with your email.")}
              />
            </div>

            <OrDivider label="or use your email" />

            <div className="space-y-5">
              <AuthField
                label="First name"
                icon={User}
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <AuthField
                label="Email"
                icon={Mail}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <AuthField
                label="Password"
                icon={Lock}
                isPassword
                autoComplete="new-password"
                error={errors.password?.message}
                hint={
                  password.length >= PASSWORD_MIN_LENGTH
                    ? "Good, that's long enough."
                    : `At least ${PASSWORD_MIN_LENGTH} characters${password ? ` (${PASSWORD_MIN_LENGTH - password.length} more)` : ""}.`
                }
                {...register("password")}
              />
            </div>

            {/* Phones only: on desktop the brand panel already says this */}
            <p className="text-sm text-muted-foreground lg:hidden">
              You&apos;re preparing for UTME. Post-UTME and more exams are coming soon.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <PanelHeading
              title={`Hi ${firstName.trim() || "there"}, choose your subjects`}
              subtitle="UTME has four subjects. Use of English is compulsory, so pick three more."
            />

            {/* Stream */}
            <fieldset>
              <legend className="mb-3 text-sm font-semibold">Your stream</legend>
              <div className="grid grid-cols-3 gap-2">
                {DEPARTMENTS.map(({ value, label }) => (
                  <label key={value} className="relative">
                    <input
                      type="radio"
                      name="stream"
                      value={value}
                      checked={stream === value}
                      onChange={() => chooseStream(value)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "flex h-11 cursor-pointer items-center justify-center rounded-xl border bg-card px-2 text-center text-sm font-semibold shadow-soft transition-colors",
                        "peer-checked:border-brand-orange peer-checked:bg-brand-orange/10 peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                      )}
                    >
                      {label.replace(" / Humanities", "")}
                    </span>
                  </label>
                ))}
              </div>
              {errors.stream ? <p className="mt-2 text-sm text-destructive">{errors.stream.message}</p> : null}
            </fieldset>

            {/* Subjects */}
            {stream ? (
              <fieldset>
                <legend className="mb-3 flex w-full items-center justify-between text-sm font-semibold">
                  <span>Your subjects</span>
                  <span className="font-normal text-muted-foreground" aria-live="polite">
                    {remaining > 0 ? `Choose ${remaining} more` : "All set"}
                  </span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-brand-orange bg-brand-orange/10 px-3.5 text-sm font-semibold">
                    <Check className="h-4 w-4 text-brand-text" aria-hidden="true" />
                    Use of English
                    <span className="font-normal text-muted-foreground">· compulsory</span>
                  </span>
                  {streamSubjects.map((value) => {
                    const isChosen = electives.includes(value);
                    const isLocked = !isChosen && remaining === 0;
                    return (
                      <label key={value} className="relative">
                        <input
                          type="checkbox"
                          checked={isChosen}
                          disabled={isLocked}
                          onChange={() => toggleElective(value)}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border bg-card px-3.5 text-sm font-medium transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                            isChosen && "border-brand-orange bg-brand-orange/10 font-semibold",
                            isLocked && "cursor-not-allowed border-dashed bg-transparent text-muted-foreground",
                          )}
                        >
                          {isChosen ? <Check className="h-4 w-4 text-brand-text" aria-hidden="true" /> : null}
                          {subjectName(value)}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.electives ? (
                  <p className="mt-2 text-sm text-destructive">{errors.electives.message}</p>
                ) : null}
              </fieldset>
            ) : (
              <p className="text-sm text-muted-foreground">Choose your stream to see its subjects.</p>
            )}

            {remaining === 0 ? (
              <p className="rounded-xl border bg-card p-4 text-sm shadow-soft">
                You&apos;ll practise{" "}
                <span className="font-semibold">
                  {[COMPULSORY_SUBJECT, ...electives].map(subjectName).join(", ")}
                </span>
                .
              </p>
            ) : null}
          </div>
        )}

        {/* Actions: sticky on phones so they are always in reach */}
        <div className="sticky bottom-0 -mx-6 mt-8 flex items-center gap-3 border-t bg-background/95 px-6 py-4 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          {step === 2 ? (
            <button type="button" onClick={() => setStep(1)} className={secondaryButtonClass} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : null}
          <button
            type="submit"
            className={cn(primaryButtonClass, "flex-1")}
            disabled={isLoading || (step === 2 && remaining !== 0)}
          >
            {step === 1 ? (
              <>
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            ) : isLoading ? (
              "Creating your account…"
            ) : (
              "Create account"
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3 text-center text-sm text-muted-foreground">
        <p>
          Already have an account? <TextButton onClick={onSignIn}>Sign in</TextButton>
        </p>
        <p className="text-pretty">
          Signing up a tutoring centre or school? Group accounts are coming soon. For now, each
          student can create their own free account.
        </p>
      </div>
    </div>
  );
};

export default SignUpWizard;
