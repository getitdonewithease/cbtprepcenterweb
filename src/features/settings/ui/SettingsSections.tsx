import { useId, useState } from "react";
import { Check, Lock, Monitor, Moon, Sun } from "lucide-react";
import { useThemePreference, type ThemeChoice } from "@/core/theme/useThemePreference";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING } from "@/core/ui/styles";
import { COMPULSORY_SUBJECT, DEPARTMENTS, getSubjectLabel } from "@/features/exams";
import { availableAvatars } from "../data/constants";
import {
  SUBJECT_COUNT,
  TARGET_MAX,
  TARGET_MIN,
  nameError,
  normaliseSubjects,
  passwordError,
  subjectsAfterDepartmentChange,
  subjectsError,
  subjectsForDepartment,
  targetError,
} from "../service/settingsService";
import type { SettingsProfile } from "../types/settingsTypes";
import { Field, FieldError, INPUT, SaveBar, quietButton, secondaryButton, useDraft } from "./settingsParts";

/**
 * The four settings sections. Each keeps a draft and saves with its own button; only what
 * the API really saves is here. University and course have no field in the API yet.
 */

interface SectionProps {
  profile: SettingsProfile;
  onDirtyChange: (dirty: boolean) => void;
}

const initialsOf = (p: Pick<SettingsProfile, "firstName" | "lastName" | "email">) =>
  `${p.firstName.trim().charAt(0)}${p.lastName.trim().charAt(0)}`.toUpperCase() || p.email.charAt(0).toUpperCase() || "?";

export const Avatar = ({ src, initials, size = "h-12 w-12" }: { src: string; initials: string; size?: string }) => {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img src={src} alt="" onError={() => setFailed(true)} className={cn(size, "shrink-0 rounded-full bg-muted object-cover")} />
  ) : (
    <span className={cn(size, "flex shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-base font-bold text-brand-text")} aria-hidden="true">
      {initials}
    </span>
  );
};

// ── Profile ───────────────────────────────────────────────────────────────────────────

export const ProfileSection = ({ profile, onDirtyChange, onSave }: SectionProps & { onSave: (changes: Partial<SettingsProfile>) => Promise<void> }) => {
  const ids = { first: useId(), last: useId(), email: useId(), firstError: useId() };
  const d = useDraft({ firstName: profile.firstName, lastName: profile.lastName, avatar: profile.avatar }, onDirtyChange);
  const [picking, setPicking] = useState(false);
  const [tried, setTried] = useState(false);
  const firstError = tried ? nameError(d.draft.firstName) : null;

  const save = () => {
    setTried(true);
    if (nameError(d.draft.firstName)) return;
    void d.save(() => onSave({ firstName: d.draft.firstName.trim(), lastName: d.draft.lastName.trim(), avatar: d.draft.avatar }));
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <Field label="Photo" hint="Shown on your account menu">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar src={d.draft.avatar} initials={initialsOf({ ...d.draft, email: profile.email })} />
          <button type="button" onClick={() => setPicking((p) => !p)} aria-expanded={picking} className={secondaryButton()}>
            {picking ? "Done choosing" : "Change photo"}
          </button>
        </div>
        {picking && (
          // Chosen here, inside the section: no second dialog over the settings dialog
          <div role="radiogroup" aria-label="Choose a photo" className="mt-3 grid max-w-md grid-cols-5 gap-2">
            {["", ...availableAvatars].map((src, i) => {
              const chosen = d.draft.avatar === src;
              return (
                <button
                  key={src || "initials"}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  aria-label={src ? `Picture ${i}` : "Your initials"}
                  onClick={() => d.setDraft({ ...d.draft, avatar: src })}
                  className={cn("flex aspect-square items-center justify-center rounded-full p-0.5", chosen ? "ring-2 ring-foreground" : "hover:ring-2 hover:ring-border", FOCUS_RING)}
                >
                  <Avatar src={src} initials={initialsOf({ ...d.draft, email: profile.email })} size="h-full w-full" />
                </button>
              );
            })}
          </div>
        )}
      </Field>
      <Field label="First name" htmlFor={ids.first}>
        <input
          id={ids.first}
          className={INPUT}
          value={d.draft.firstName}
          autoComplete="given-name"
          aria-invalid={Boolean(firstError)}
          aria-describedby={firstError ? ids.firstError : undefined}
          onChange={(e) => d.setDraft({ ...d.draft, firstName: e.target.value })}
        />
        <FieldError id={ids.firstError} message={firstError} />
      </Field>
      <Field label="Last name" htmlFor={ids.last}>
        <input id={ids.last} className={INPUT} value={d.draft.lastName} autoComplete="family-name" onChange={(e) => d.setDraft({ ...d.draft, lastName: e.target.value })} />
      </Field>
      <Field label="Email" hint="Used to sign in; it can't be changed here" htmlFor={ids.email}>
        <input id={ids.email} className={cn(INPUT, "bg-muted text-muted-foreground")} value={profile.email} readOnly />
      </Field>
      <SaveBar dirty={d.dirty} status={d.status} error={d.error} onSave={save} asSubmit />
    </form>
  );
};

// ── UTME subjects ─────────────────────────────────────────────────────────────────────

export const SubjectsSection = ({ profile, onDirtyChange, onSave }: SectionProps & { onSave: (changes: Partial<SettingsProfile>) => Promise<void> }) => {
  const deptId = useId();
  const d = useDraft({ department: profile.department, subjects: normaliseSubjects(profile.subjects) }, onDirtyChange);
  const chosen = d.draft.subjects;
  const complete = chosen.length === SUBJECT_COUNT;
  const offered = [...new Set([COMPULSORY_SUBJECT, ...subjectsForDepartment(d.draft.department), ...chosen])];
  const missing = subjectsError(chosen);

  const toggle = (value: string) => {
    if (value === COMPULSORY_SUBJECT) return;
    const next = chosen.includes(value) ? chosen.filter((s) => s !== value) : complete ? chosen : [...chosen, value];
    d.setDraft({ ...d.draft, subjects: next });
  };

  return (
    <div>
      <p className="max-w-prose pb-2 text-pretty text-sm text-muted-foreground">
        Your four UTME subjects decide which questions your tests use. Use of English is compulsory. A change applies to the tests you take next.
      </p>
      <Field label="Department" htmlFor={deptId}>
        <select
          id={deptId}
          className={cn(INPUT, "sm:max-w-xs")}
          value={d.draft.department}
          onChange={(e) => d.setDraft({ department: e.target.value, subjects: subjectsAfterDepartmentChange(chosen, e.target.value) })}
        >
          {!d.draft.department && <option value="">Choose your department</option>}
          {DEPARTMENTS.map((dep) => (
            <option key={dep.value} value={dep.value}>
              {dep.label}
            </option>
          ))}
        </select>
        {!d.draft.department && <p className="mt-1.5 text-sm font-semibold text-destructive">Choose your department to save your subjects.</p>}
      </Field>
      <Field label="Subjects" hint={complete ? "All four chosen. Remove one to pick another." : `${chosen.length} of 4 chosen`}>
        <div role="group" aria-label="Your subjects" className="flex flex-wrap gap-2">
          {offered.map((value) => {
            const on = chosen.includes(value);
            const locked = value === COMPULSORY_SUBJECT;
            const full = !on && complete;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                aria-disabled={locked || full}
                onClick={() => !full && toggle(value)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold",
                  on ? "border-foreground bg-foreground text-background" : "text-foreground hover:bg-muted",
                  locked && "cursor-default",
                  full && "cursor-not-allowed text-muted-foreground hover:bg-transparent",
                  FOCUS_RING,
                )}
              >
                {locked ? <Lock className="h-3.5 w-3.5" aria-hidden="true" /> : on ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {getSubjectLabel(value)}
                {locked && <span className="sr-only">(compulsory)</span>}
              </button>
            );
          })}
        </div>
        {!complete && <p className="mt-2 text-sm font-semibold text-destructive">{missing}</p>}
      </Field>
      <SaveBar
        dirty={d.dirty && complete && Boolean(d.draft.department)}
        status={d.status}
        error={d.error}
        onSave={() => void d.save(() => onSave({ department: d.draft.department, subjects: d.draft.subjects }))}
      />
    </div>
  );
};

// ── Your goal ─────────────────────────────────────────────────────────────────────────

export const GoalSection = ({ profile, onDirtyChange, onSave }: SectionProps & { onSave: (target: number) => Promise<void> }) => {
  const ids = { target: useId(), error: useId() };
  const d = useDraft({ target: profile.targetScore === null ? "" : String(profile.targetScore) }, onDirtyChange);
  const error = d.dirty ? targetError(d.draft.target) : null;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (d.dirty && !error) void d.save(() => onSave(Number(d.draft.target)));
      }}
    >
      <p className="max-w-prose pb-2 text-pretty text-sm text-muted-foreground">
        Your dashboard measures your score against this target. Most competitive courses ask for 250 or more.
      </p>
      <Field label="Target score" hint={`Out of 400, between ${TARGET_MIN} and ${TARGET_MAX}`} htmlFor={ids.target}>
        <input
          id={ids.target}
          type="number"
          inputMode="numeric"
          min={TARGET_MIN}
          max={TARGET_MAX}
          step={10}
          placeholder="250"
          className={cn(INPUT, "w-32")}
          value={d.draft.target}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? ids.error : undefined}
          onChange={(e) => d.setDraft({ target: e.target.value })}
        />
        <FieldError id={ids.error} message={error} />
      </Field>
      <SaveBar dirty={d.dirty && !error} status={d.status} error={d.error} onSave={() => void d.save(() => onSave(Number(d.draft.target)))} asSubmit />
    </form>
  );
};

// ── Sign-in and security ──────────────────────────────────────────────────────────────

export const SignInSection = ({
  profile,
  onDirtyChange,
  onChangePassword,
  onSendConfirmation,
}: SectionProps & { onChangePassword: (current: string, next: string) => Promise<void>; onSendConfirmation: () => Promise<void> }) => {
  const ids = { current: useId(), next: useId(), repeat: useId(), error: useId(), hint: useId() };
  const [showForm, setShowForm] = useState(false);
  const [link, setLink] = useState<{ status: "idle" | "sending" | "sent" | "error"; message?: string }>({ status: "idle" });
  const d = useDraft({ current: "", next: "", repeat: "" }, onDirtyChange);
  const [tried, setTried] = useState(false);
  const formError = tried ? passwordError(d.draft.current, d.draft.next, d.draft.repeat) : null;

  const sendLink = async () => {
    setLink({ status: "sending" });
    try {
      await onSendConfirmation();
      setLink({ status: "sent" });
    } catch (e) {
      setLink({ status: "error", message: e instanceof Error ? e.message : undefined });
    }
  };

  const submit = () => {
    setTried(true);
    if (passwordError(d.draft.current, d.draft.next, d.draft.repeat)) return;
    void d.save(async () => {
      await onChangePassword(d.draft.current, d.draft.next);
      d.setDraft({ current: "", next: "", repeat: "" });
      setTried(false);
      setShowForm(false);
    });
  };

  return (
    <div>
      <Field label="Email address" hint={profile.email}>
        {profile.emailConfirmed ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> Confirmed
          </p>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold">Not confirmed yet</span>
              <button type="button" onClick={() => void sendLink()} disabled={link.status === "sending" || link.status === "sent"} className={secondaryButton()}>
                {link.status === "sending" ? "Sending…" : link.status === "sent" ? "Link sent" : "Send confirmation link"}
              </button>
            </div>
            <p role="status" className="mt-1.5 text-sm text-muted-foreground">
              {link.status === "sent" ? "Check your inbox for the link." : ""}
            </p>
            {link.status === "error" && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {link.message}
              </p>
            )}
          </div>
        )}
      </Field>
      <Field label="Password">
        {showForm ? (
          <form
            className="grid gap-2 sm:max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label htmlFor={ids.current} className="text-sm font-semibold">Current password</label>
            <input id={ids.current} type="password" autoComplete="current-password" className={INPUT} value={d.draft.current} onChange={(e) => d.setDraft({ ...d.draft, current: e.target.value })} />
            <label htmlFor={ids.next} className="mt-2 text-sm font-semibold">New password</label>
            <input id={ids.next} type="password" autoComplete="new-password" aria-describedby={`${ids.hint}${formError ?? d.error ? ` ${ids.error}` : ""}`} aria-invalid={Boolean(formError)} className={INPUT} value={d.draft.next} onChange={(e) => d.setDraft({ ...d.draft, next: e.target.value })} />
            <p id={ids.hint} className="text-xs text-muted-foreground">At least 8 characters.</p>
            <label htmlFor={ids.repeat} className="mt-2 text-sm font-semibold">Repeat the new password</label>
            <input id={ids.repeat} type="password" autoComplete="new-password" className={INPUT} value={d.draft.repeat} onChange={(e) => d.setDraft({ ...d.draft, repeat: e.target.value })} />
            <FieldError id={ids.error} message={formError ?? d.error} />
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={d.status === "saving"} className={secondaryButton()}>
                {d.status === "saving" ? "Changing…" : "Change password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  d.setDraft({ current: "", next: "", repeat: "" });
                  setTried(false);
                  setShowForm(false);
                }}
                className={quietButton()}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setShowForm(true)} className={secondaryButton()}>
              Change password
            </button>
            {d.status === "saved" && (
              <span role="status" className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> Password changed
              </span>
            )}
          </div>
        )}
      </Field>
    </div>
  );
};

// ── Appearance ────────────────────────────────────────────────────────────────────────

const THEME_OPTIONS: Array<{ value: ThemeChoice; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match device", icon: Monitor },
];

/** Applies at once on this device; nothing to save, so no Save button and no leave check. */
export const AppearanceSection = () => {
  const { choice, setChoice } = useThemePreference();
  return (
    <div>
      <Field label="Theme" hint="On this device">
        <div role="radiogroup" aria-label="Theme" className="inline-flex flex-wrap gap-1 rounded-xl bg-muted p-1">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const on = choice === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setChoice(value)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold",
                  on ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                  FOCUS_RING,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 max-w-prose text-pretty text-sm text-muted-foreground">
          Saved questions and a few other pages stay light until they are redesigned.
        </p>
      </Field>
    </div>
  );
};
