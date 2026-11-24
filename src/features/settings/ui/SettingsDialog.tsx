import { useCallback, useState, type ComponentType } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight, KeyRound, Target, User, X } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE } from "@/core/ui/styles";
import { getSubjectLabel } from "@/features/exams";
import { useSettings } from "../hooks/useSettings";
import type { SectionId, SettingsProfile } from "../types/settingsTypes";
import { GoalSection, ProfileSection, SignInSection, SubjectsSection } from "./SettingsSections";
import { primaryButton, quietButton, secondaryButton } from "./settingsParts";

/**
 * Settings, as a dialog over the page you were on (design approved 2026-11-24). Its address
 * is /settings/:section, so links like "set your subjects" open the right section and Back
 * closes it. Desktop: the sections listed on the left. Phone: full screen, the list first,
 * a section over it with a back arrow. A section with unsaved changes asks before you leave
 * it, inline, never as a second dialog.
 */

const SECTIONS: Array<{ id: SectionId; label: string; icon: ComponentType<{ className?: string }>; summary: (p: SettingsProfile) => string }> = [
  { id: "profile", label: "Profile", icon: User, summary: (p) => `${p.firstName} ${p.lastName}`.trim() || p.email },
  { id: "subjects", label: "UTME subjects", icon: BookOpen, summary: (p) => (p.subjects.length ? p.subjects.map(getSubjectLabel).join(", ") : "Not chosen yet") },
  { id: "goal", label: "Your goal", icon: Target, summary: (p) => (p.targetScore ? `${p.targetScore} / 400` : "No target yet") },
  { id: "sign-in", label: "Sign-in and security", icon: KeyRound, summary: (p) => (p.emailConfirmed ? "Email confirmed" : "Email not confirmed yet") },
];

const isSection = (value: string | undefined): value is SectionId => SECTIONS.some((s) => s.id === value);

const ICON_BUTTON = cn(
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground",
  PRESSABLE,
  FOCUS_RING,
);

/** Leaving a section with unsaved changes asks first. */
const useLeaveGuard = () => {
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<null | (() => void)>(null);
  const attempt = (action: () => void) => (dirty ? setPending(() => action) : action());
  const discard = () => {
    const action = pending;
    setPending(null);
    setDirty(false);
    action?.();
  };
  const onDirtyChange = useCallback((d: boolean) => setDirty(d), []);
  return { attempt, discard, keep: () => setPending(null), pending: Boolean(pending), onDirtyChange };
};

const DiscardBar = ({ onDiscard, onKeep }: { onDiscard: () => void; onKeep: () => void }) => (
  <div role="alertdialog" aria-label="Unsaved changes" className="flex flex-wrap items-center justify-between gap-2 border-t bg-card px-5 py-3">
    <p className="text-sm font-semibold">You have changes that aren't saved.</p>
    <div className="flex gap-2">
      <button type="button" autoFocus onClick={onKeep} className={secondaryButton()}>
        Keep editing
      </button>
      <button type="button" onClick={onDiscard} className={quietButton("text-destructive hover:text-destructive")}>
        Discard them
      </button>
    </div>
  </div>
);

const SettingsDialog = () => {
  const { section: sectionParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasPageBehind = Boolean((location.state as { backgroundLocation?: unknown } | null)?.backgroundLocation);
  const section: SectionId = isSection(sectionParam) ? sectionParam : "profile";
  // Phones: an address naming a section opens it; /settings alone shows the list
  const [phoneShowsSection, setPhoneShowsSection] = useState(isSection(sectionParam));
  const { state, reload, saveProfile, saveTargetScore, changePassword, sendEmailConfirmation } = useSettings();
  const guard = useLeaveGuard();

  const close = () => guard.attempt(() => (hasPageBehind ? navigate(-1) : navigate("/dashboard", { replace: true })));
  // Section changes replace the address, so Back still closes the dialog in one step
  const open = (id: SectionId) =>
    guard.attempt(() => {
      navigate(`/settings/${id}`, { replace: true, state: location.state });
      setPhoneShowsSection(true);
    });
  const current = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  let body;
  if (state.status === "loading") {
    body = (
      <div aria-busy="true" className="space-y-4 pt-2">
        <p role="status" className="sr-only">
          Loading your settings
        </p>
        {[0, 1, 2].map((i) => (
          <span key={i} className="block h-11 w-full max-w-md animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        ))}
      </div>
    );
  } else if (state.status === "error") {
    body = (
      <div role="alert" className="max-w-md pt-2">
        <p className="font-semibold">We couldn't load your settings.</p>
        <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
        <button type="button" onClick={() => void reload()} className={primaryButton("mt-4")}>
          Try again
        </button>
      </div>
    );
  } else {
    const props = { profile: state.profile, onDirtyChange: guard.onDirtyChange };
    body =
      section === "profile" ? (
        <ProfileSection key="profile" {...props} onSave={saveProfile} />
      ) : section === "subjects" ? (
        <SubjectsSection key="subjects" {...props} onSave={saveProfile} />
      ) : section === "goal" ? (
        <GoalSection key="goal" {...props} onSave={saveTargetScore} />
      ) : (
        <SignInSection key="sign-in" {...props} onChangePassword={changePassword} onSendConfirmation={sendEmailConfirmation} />
      );
  }

  return (
    <Dialog.Root open onOpenChange={(next) => !next && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
        <Dialog.Content
          aria-describedby={undefined}
          tabIndex={-1}
          // Focus lands on the dialog itself; Tab then reaches the sections
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.focus();
          }}
          onInteractOutside={(e) => guard.pending && e.preventDefault()}
          className="fasiti-theme fixed inset-0 z-50 flex flex-col bg-card text-foreground shadow-soft outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[min(44rem,90dvh)] sm:w-[min(60rem,94vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:data-[state=open]:zoom-in-95 motion-reduce:animate-none"
        >
          <header className="flex min-h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-5">
            {phoneShowsSection && (
              <button
                type="button"
                onClick={() => guard.attempt(() => setPhoneShowsSection(false))}
                aria-label="Back to all settings"
                className={cn(ICON_BUTTON, "sm:hidden")}
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <Dialog.Title className="flex-1 text-lg font-bold">
              <span className={cn(phoneShowsSection && "hidden sm:inline")}>Settings</span>
              {phoneShowsSection && <span className="sm:hidden">{current.label}</span>}
            </Dialog.Title>
            <button type="button" onClick={close} aria-label="Close settings" className={ICON_BUTTON}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="flex min-h-0 flex-1">
            <nav aria-label="Settings sections" className={cn("w-full shrink-0 overflow-y-auto p-3 sm:w-64 sm:border-r", phoneShowsSection && "hidden sm:block")}>
              <ul className="space-y-1">
                {SECTIONS.map(({ id, label, icon: Icon, summary }) => {
                  const active = id === section;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        aria-current={active ? "page" : undefined}
                        onClick={() => open(id)}
                        className={cn("flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left", active ? "sm:bg-muted sm:font-semibold" : "hover:bg-muted", FOCUS_RING)}
                      >
                        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px]">{label}</span>
                          {state.status === "ready" && <span className="block truncate text-xs text-muted-foreground sm:hidden">{summary(state.profile)}</span>}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground sm:hidden" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className={cn("min-w-0 flex-1 flex-col", phoneShowsSection ? "flex" : "hidden sm:flex")}>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-8">
                <h2 className="hidden text-xl font-extrabold tracking-[-0.02em] sm:block">{current.label}</h2>
                <div className="sm:mt-2">{body}</div>
              </div>
              {guard.pending && <DiscardBar onDiscard={guard.discard} onKeep={guard.keep} />}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SettingsDialog;
