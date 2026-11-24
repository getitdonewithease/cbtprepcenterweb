import { describe, expect, it } from "vitest";
import { DomainError } from "@/core/errors";
import {
  friendlyError,
  nameError,
  normaliseSubjects,
  passwordError,
  subjectsAfterDepartmentChange,
  subjectsError,
  targetError,
} from "../settingsService";

describe("settings rules", () => {
  it("keeps English first and four subjects at most, without duplicates", () => {
    expect(normaliseSubjects(["Physics", "english", "physics", "biology", "chemistry", "mathematics"])).toEqual([
      "english",
      "physics",
      "biology",
      "chemistry",
    ]);
    expect(normaliseSubjects(["biology"])).toEqual(["english", "biology"]);
  });

  it("says how many subjects are missing", () => {
    expect(subjectsError(["english", "physics"])).toBe("Choose 2 more subjects.");
    expect(subjectsError(["english", "physics", "biology"])).toBe("Choose 1 more subject.");
    expect(subjectsError(["english", "physics", "biology", "chemistry"])).toBeNull();
  });

  it("drops subjects the new department doesn't offer, keeping English", () => {
    expect(subjectsAfterDepartmentChange(["english", "mathematics", "physics", "biology"], "Commercial")).toEqual(["english", "mathematics"]);
  });

  it("checks the name, the target and the new password", () => {
    expect(nameError("  ")).toBe("Enter your first name.");
    expect(nameError("Ada")).toBeNull();
    expect(targetError("250")).toBeNull();
    expect(targetError("99")).toBe("Choose a target between 100 and 400.");
    expect(targetError("250.5")).toBe("Enter a whole number.");
    expect(passwordError("", "newpassword", "newpassword")).toBe("Enter your current password.");
    expect(passwordError("old", "short", "short")).toBe("Your new password needs at least 8 characters.");
    expect(passwordError("old", "newpassword", "different")).toBe("The two new passwords don't match.");
    expect(passwordError("samepassword", "samepassword", "samepassword")).toBe("Choose a password different from your current one.");
    expect(passwordError("old", "newpassword", "newpassword")).toBeNull();
  });

  it("shows a backend validation sentence but never a field key or raw error", () => {
    const domain = new DomainError("Validation failed", { NewPassword: ["Password must contain a digit."] });
    expect(friendlyError(domain, "fallback")).toBe("Password must contain a digit.");
    expect(friendlyError(new Error("Request failed with status code 500"), "We couldn't save that.")).toBe("We couldn't save that.");
  });
});
