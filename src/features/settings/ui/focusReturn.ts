/**
 * Where focus goes when the settings dialog closes. The dialog opens by address, often from
 * a menu item that is gone by the time it closes, so whatever opened it says where to
 * come back to (the account button, the "set your subjects" link).
 */
let returnTarget: HTMLElement | null = null;

export const setSettingsReturnFocus = (element: HTMLElement | null) => {
  returnTarget = element;
};

export const restoreSettingsFocus = () => {
  const target = returnTarget;
  returnTarget = null;
  // After the route change has rendered the page behind
  window.requestAnimationFrame(() => {
    if (target?.isConnected) target.focus();
  });
};

/** Features that can't import settings (it imports them) announce the element instead. */
export const SETTINGS_RETURN_FOCUS_EVENT = "fasiti:settings-return-focus";
if (typeof window !== "undefined") {
  window.addEventListener(SETTINGS_RETURN_FOCUS_EVENT, (event) => {
    const detail = (event as CustomEvent<unknown>).detail;
    if (detail instanceof HTMLElement) returnTarget = detail;
  });
}
