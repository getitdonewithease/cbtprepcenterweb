import { describe, expect, it } from "vitest";
import { buildTutorSuggestions } from "../tutorSuggestionsService";

const COURSES = ["english", "mathematics", "biology", "physics"];

describe("buildTutorSuggestions", () => {
  it("offers the unpractised subject, the strongest subject to quiz, and a wrong-answer helper", () => {
    const suggestions = buildTutorSuggestions(
      COURSES,
      [
        { subjectName: "biology", percentage: 0 },
        { subjectName: "english", percentage: 0 },
        { subjectName: "mathematics", percentage: 40 },
      ],
      [],
    );
    expect(suggestions.map((s) => s.label)).toEqual([
      "Teach me Physics from the start",
      "Quiz me on Mathematics",
      "Explain a question I got wrong",
    ]);
    expect(suggestions[1].reason).toBe("Your best subject so far, at 40%");
    expect(suggestions[2].fillOnly).toBe(true);
  });

  it("names the weakest topic when topic data exists", () => {
    const [first] = buildTutorSuggestions(COURSES, [{ subjectName: "physics", percentage: 30 }], [
      { topicName: "Projectile motion", subjectName: "physics", confidenceLevelValue: 0.2, confidenceLevel: "Low" },
    ]);
    expect(first.label).toBe("Teach me Projectile motion");
  });

  it("falls back to the candidate's own subjects with no results yet, never inventing scores", () => {
    const suggestions = buildTutorSuggestions(COURSES, [], []);
    expect(suggestions.map((s) => s.label)).toEqual(["Quiz me on Use of English", "Explain a question I got wrong"]);
    expect(suggestions[0].reason).toBe("One of your four subjects");
  });
});
