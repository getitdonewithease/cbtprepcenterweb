import { describe, expect, it } from "vitest";
import { buildQuestionContext, stripQuestionContext, withQuestionContext } from "../questionContext";

const question = {
  id: "q4",
  text: "The ratio of <b>tall</b> to dwarf offspring is",
  options: ["1 : 1", "1 : 2 : 1", "3 : 1", "9 : 3 : 3 : 1"],
  userAnswerIndex: 1,
  correctAnswerIndex: 2,
};

describe("question context for the AI tutor", () => {
  it("names the question, every option, the student's pick and the answer, without HTML", () => {
    const context = buildQuestionContext(question);
    expect(context).toContain("Question Reference 1 (ID: q4)");
    expect(context).toContain("Question: The ratio of tall to dwarf offspring is");
    expect(context).toContain("D. 9 : 3 : 3 : 1");
    expect(context).toContain("Student's chosen option: B. 1 : 2 : 1");
    expect(context).toContain("Correct option: C. 3 : 1");
  });

  it("says when the question was skipped", () => {
    expect(buildQuestionContext({ ...question, userAnswerIndex: undefined })).toContain("Student's chosen option: none (skipped)");
  });

  it("gives back only what the student wrote, blank lines included", () => {
    const message = "Why is B wrong?\n\nI thought it was the ratio.";
    expect(stripQuestionContext(withQuestionContext(buildQuestionContext(question), message))).toBe(message);
  });

  it("strips the older review chat format and leaves other messages alone", () => {
    expect(stripQuestionContext("Question Reference 1 (ID: x):\nQuestion: y\n\nExplain this")).toBe("Explain this");
    expect(stripQuestionContext("What is osmosis?")).toBe("What is osmosis?");
  });
});
