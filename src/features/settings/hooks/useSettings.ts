import { useCallback, useEffect, useState } from "react";
import { PROFILE_UPDATED_EVENT } from "@/features/dashboard";
import { friendlyError, settingsService } from "../service/settingsService";
import type { SettingsProfile } from "../types/settingsTypes";

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; profile: SettingsProfile };

/**
 * The candidate's settings: loaded once when the dialog opens; each save sends the whole
 * profile (the API saves name, subjects and photo together) and tells the page behind.
 * Saves reject with a sentence fit to show.
 */
export const useSettings = () => {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      setState({ status: "ready", profile: await settingsService.getProfile() });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const announce = () => window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));

  const saveProfile = useCallback(
    async (changes: Partial<SettingsProfile>) => {
      if (state.status !== "ready") return;
      const next = { ...state.profile, ...changes };
      try {
        await settingsService.saveProfile(next);
      } catch (error) {
        throw new Error(friendlyError(error, "We couldn't save that. Check your connection and try again."));
      }
      setState({ status: "ready", profile: next });
      announce();
    },
    [state],
  );

  const saveTargetScore = useCallback(async (target: number) => {
    try {
      await settingsService.saveTargetScore(target);
    } catch (error) {
      throw new Error(friendlyError(error, "We couldn't save your target. Check your connection and try again."));
    }
    setState((current) => (current.status === "ready" ? { status: "ready", profile: { ...current.profile, targetScore: target } } : current));
    announce();
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    try {
      await settingsService.changePassword(current, next);
    } catch (error) {
      throw new Error(friendlyError(error, "We couldn't change your password. Check your current password and try again."));
    }
  }, []);

  const sendEmailConfirmation = useCallback(async () => {
    try {
      await settingsService.sendEmailConfirmation();
    } catch (error) {
      throw new Error(friendlyError(error, "We couldn't send the link. Try again in a minute."));
    }
  }, []);

  return { state, reload: load, saveProfile, saveTargetScore, changePassword, sendEmailConfirmation };
};
