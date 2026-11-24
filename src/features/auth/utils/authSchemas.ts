import { z } from "zod";
import { COMPULSORY_SUBJECT, DEPARTMENTS } from "@/features/exams";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address, like name@example.com.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const PASSWORD_MIN_LENGTH = 8;

/** UTME: Use of English plus three more subjects. */
export const UTME_ELECTIVE_COUNT = 3;

const streamValues = DEPARTMENTS.map((d) => d.value) as [string, ...string[]];

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(50, "Use 50 characters or fewer."),
  email,
  password: z.string().min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`),
  stream: z.enum(streamValues, { errorMap: () => ({ message: "Choose your stream." }) }),
  electives: z
    .array(z.string())
    .length(UTME_ELECTIVE_COUNT, `Choose ${UTME_ELECTIVE_COUNT} subjects to go with Use of English.`)
    .refine((subjects) => !subjects.includes(COMPULSORY_SUBJECT), {
      message: "Use of English is already included.",
    }),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

/** Fields validated before leaving each sign-up step. */
export const SIGN_UP_STEP_FIELDS: Record<1 | 2, (keyof SignUpValues)[]> = {
  1: ["firstName", "email", "password"],
  2: ["stream", "electives"],
};
