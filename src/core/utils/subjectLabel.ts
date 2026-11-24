/** A subject as people say it, from however the API stores it ("english" → "Use of English"). */

const SUBJECT_LABELS: Record<string, string> = {
  english: "Use of English",
  "use of english": "Use of English",
  mathematics: "Mathematics",
  maths: "Mathematics",
};

export const subjectLabel = (raw: string): string => {
  const key = raw.trim().toLowerCase();
  return SUBJECT_LABELS[key] ?? key.replace(/\b\w/g, (c) => c.toUpperCase());
};
