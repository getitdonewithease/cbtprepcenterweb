import { AppError, DomainError } from "@/core/errors";
import { prepareTest as requestPreparedTest } from "../api/dashboardApi";
import type { PrepareTestPayload } from "../types/dashboardTypes";

const FALLBACK = "We couldn't prepare your questions. Please try again.";
const OFFLINE = "We couldn't reach Fasiti. Check your connection, then try again.";

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`;

/** "01:12:33.1234567" becomes "1 hour 13 minutes"; always rounds up. */
const describeWait = (hours: string, minutes: string, seconds: string) => {
  const total = Math.max(
    1,
    Number(hours) * 60 + Number(minutes) + (Number(seconds) > 0 ? 1 : 0),
  );
  const h = Math.floor(total / 60);
  const m = total % 60;

  return [h > 0 && plural(h, "hour"), m > 0 && plural(m, "minute")].filter(Boolean).join(" ");
};

/**
 * The API has no machine-readable error codes: its English sentence arrives as either the
 * key or the value of `errors`. Known sentences become our own copy; nothing else is shown.
 */
const toStudentMessage = (error: unknown): string => {
  if (!(error instanceof AppError)) return FALLBACK;

  if (!(error instanceof DomainError)) {
    // No status means no response arrived at all
    return error.context?.statusCode === undefined ? OFFLINE : FALLBACK;
  }

  const reported = Object.entries(error.details).flat(2).join(" ");

  if (/active \w+ CBT session/i.test(reported)) {
    return "You already have a test in progress. Finish or cancel it in Test History, then start a new one.";
  }

  const wait = reported.match(/Wait for (\d\d):(\d\d):(\d\d(?:\.\d+)?)/i);
  if (wait) {
    return `You can take your next standard test in ${describeWait(wait[1], wait[2], wait[3])}. You can take a custom test now.`;
  }

  if (/consists of 4 subjects/i.test(reported)) {
    return "A standard test needs 4 subjects. Choose yours in Settings, then try again.";
  }

  return FALLBACK;
};

/** Prepares a test. Rejects only with an AppError whose message is safe to show a student. */
export const prepareTest = async (options: PrepareTestPayload): Promise<string> => {
  try {
    return await requestPreparedTest(options);
  } catch (error: unknown) {
    throw new AppError(toStudentMessage(error), "PREPARE_TEST_FAILED", undefined, error);
  }
};
