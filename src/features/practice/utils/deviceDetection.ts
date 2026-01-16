/**
 * Device detection utilities for responsive behavior
 * Separates desktop from mobile/tablet devices
 */

// Mobile breakpoint threshold (matches Tailwind's md breakpoint)
const MOBILE_BREAKPOINT = 768;

/**
 * Checks if the current device is a mobile or tablet
 * Uses window width as primary indicator
 */
export const isMobileOrTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
};

/**
 * Checks if the current device is a desktop
 */
export const isDesktop = (): boolean => {
  return !isMobileOrTablet();
};

/**
 * Detects if device supports fullscreen API
 */
export const isFullscreenSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).mozFullScreenEnabled ||
    (document as any).msFullscreenEnabled
  );
};
