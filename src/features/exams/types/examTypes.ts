export type ExamCode =
  | "utme"
  | "post-utme"
  | "sat"
  | "ielts"
  | "toefl"
  | "waec"
  | "neco";

export interface ExamFocusArea {
  display: string;
  value: string;
}

export interface ExamOption {
  code: ExamCode;
  label: string;
  shortLabel: string;
  description: string;
  status: "active" | "coming-soon";
  focusAreaLabel: string;
  focusAreaHelpText: string;
  focusAreaRequirement: {
    min: number;
    max: number;
  };
  targetScore: {
    min: number;
    max: number;
    default: number;
    helperText: string;
  };
  experienceLabel: string;
  experiencePlaceholder: string;
  firstAttemptText: string;
  returningAttemptText: string;
  focusAreas: ExamFocusArea[];
}
