/** "22 Nov" from an ISO date or date-time. */
export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

/** "22 November" from an ISO date or date-time. */
export const formatDayMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long" });
