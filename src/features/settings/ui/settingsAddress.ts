import type { Location } from "react-router-dom";
import type { SectionId } from "../types/settingsTypes";

/**
 * Where a link to settings goes, carrying the page it was opened from so the dialog opens
 * over that page and closing goes back to it. Without a section: the first section on
 * desktop, the list of sections on a phone.
 */
export const settingsAddress = (from: Location, section?: SectionId) => ({
  to: section ? `/settings/${section}` : "/settings",
  state: { backgroundLocation: from },
});
