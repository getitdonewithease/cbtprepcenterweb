import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError, DomainError, ServerError } from "@/core/errors";
import { prepareTest as prepareTestRequest } from "../../api/dashboardApi";
import { PracticeTestType } from "../../types/dashboardTypes";
import { prepareTest } from "../prepareTestService";

vi.mock("../../api/dashboardApi", () => ({ prepareTest: vi.fn() }));

const request = vi.mocked(prepareTestRequest);
const options = {
  duration: "02:00:00",
  courses: { english: 60 },
  practiceTestType: PracticeTestType.Standard,
};

// The API puts its sentence in the error code, so it arrives as a key
const apiFailure = (sentence: string) =>
  new DomainError(sentence, { [sentence]: ["A failure has occurred."] }, { statusCode: 500 });

const messageFor = async (error: unknown) => {
  request.mockRejectedValueOnce(error);
  const caught: unknown = await prepareTest(options).catch((e: unknown) => e);
  expect(caught).toBeInstanceOf(AppError);
  return (caught as AppError).message;
};

describe("prepareTestService", () => {
  beforeEach(() => request.mockReset());

  it("returns the session id on success", async () => {
    request.mockResolvedValueOnce("session-1");
    await expect(prepareTest(options)).resolves.toBe("session-1");
  });

  it("explains a test already in progress", async () => {
    const message = await messageFor(
      apiFailure("You have an active Custom CBT session. Please complete it before starting a new one."),
    );
    expect(message).toBe(
      "You already have a test in progress. Finish or cancel it in Test History, then start a new one.",
    );
  });

  it.each([
    ["01:12:33.1234567", "1 hour 13 minutes"],
    ["01:00:00", "1 hour"],
    ["01:59:30", "2 hours"],
    ["00:00:20.5", "1 minute"],
  ])("turns a wait of %s into plain time", async (wait, expected) => {
    const message = await messageFor(
      apiFailure(
        `Cannot take Standard Practice Test Now. Wait for ${wait} or Go Premium. You can keep taking Custom Test for the mian time`,
      ),
    );
    expect(message).toBe(
      `You can take your next standard test in ${expected}. You can take a custom test now.`,
    );
  });

  it("reads validation messages from the error values", async () => {
    const message = await messageFor(
      new DomainError("Data.Courses", {
        "Data.Courses": ["A standard UTME exam consists of 4 subjects"],
      }),
    );
    expect(message).toBe("A standard test needs 4 subjects. Choose yours in Settings, then try again.");
  });

  it("asks for a connection check when there was no response", async () => {
    const message = await messageFor(new ServerError("Network error. Please check your internet connection."));
    expect(message).toBe("We couldn't reach Fasiti. Check your connection, then try again.");
  });

  it.each([
    new ServerError("Request failed with status code 500", { statusCode: 500 }),
    new ServerError("An error occured", { statusCode: 500 }),
    apiFailure("NpgsqlException: relation \"StoredQuestions\" does not exist"),
    new Error("Cannot read properties of undefined"),
  ])("never passes unknown backend text through: %s", async (error) => {
    expect(await messageFor(error)).toBe("We couldn't prepare your questions. Please try again.");
  });
});
