import { fetchLowConfidenceTopics, fetchSubjectPerformance } from "../api/dashboardApi";
import type { SubjectPerformance, TopicConfidence } from "../types/dashboardTypes";
import { pickStudyFocus, subjectLabel } from "./dashboardSummaryService";

/**
 * What the AI tutor offers to start with, built only from the candidate's real data: the
 * same "study next" pick as the dashboard, their strongest subject to be quizzed on, and a
 * way in for a question they got wrong. Never invents a topic or a score.
 */

export interface TutorSuggestion {
  id: string;
  /** What the candidate sees. */
  label: string;
  /** Sent to the tutor as the candidate's message. */
  prompt: string;
  /** Why it is suggested, in the candidate's terms. */
  reason: string;
  /** Put in the message box for the candidate to finish, instead of sending. */
  fillOnly?: boolean;
}

export const buildTutorSuggestions = (
  courses: string[],
  aggregate: SubjectPerformance[],
  confidences: TopicConfidence[],
): TutorSuggestion[] => {
  const suggestions: TutorSuggestion[] = [];
  const focus = pickStudyFocus(courses, aggregate, confidences);

  if (focus.kind === "topic") {
    suggestions.push({
      id: "focus",
      label: `Teach me ${focus.topic}`,
      prompt: `Teach me ${focus.topic} in ${focus.subject} for the UTME`,
      reason: `${focus.subject}: your answers show this topic needs the most work`,
    });
  } else if (focus.kind === "unpractised") {
    suggestions.push({
      id: "focus",
      label: `Teach me ${focus.subject} from the start`,
      prompt: `Teach me ${focus.subject} from the start for the UTME`,
      reason: "You haven't practised it yet",
    });
  } else if (focus.kind === "subject") {
    suggestions.push({
      id: "focus",
      label: `Help me improve in ${focus.subject}`,
      prompt: `Help me improve in ${focus.subject} for the UTME`,
      reason: `Your lowest subject so far, at ${focus.mark}%`,
    });
  }

  const strongest = aggregate
    .filter((a) => courses.some((c) => subjectLabel(c) === subjectLabel(a.subjectName)))
    .sort((a, b) => b.percentage - a.percentage)[0];
  if (strongest && strongest.percentage > 0) {
    const subject = subjectLabel(strongest.subjectName);
    suggestions.push({
      id: "quiz",
      label: `Quiz me on ${subject}`,
      prompt: `Quiz me on ${subject} with 3 UTME-style questions`,
      reason: `Your best subject so far, at ${Math.round(strongest.percentage)}%`,
    });
  } else if (courses.length > 0) {
    const subject = subjectLabel(courses[0]);
    suggestions.push({ id: "quiz", label: `Quiz me on ${subject}`, prompt: `Quiz me on ${subject} with 3 UTME-style questions`, reason: "One of your four subjects" });
  }

  suggestions.push({
    id: "wrong",
    label: "Explain a question I got wrong",
    prompt: "Explain this question I got wrong, step by step: ",
    reason: "Paste any question from your tests",
    fillOnly: true,
  });

  return suggestions;
};

export const loadTutorSuggestions = async (courses: string[]): Promise<TutorSuggestion[]> => {
  const [aggregate, confidences] = await Promise.all([
    fetchSubjectPerformance().catch(() => [] as SubjectPerformance[]),
    fetchLowConfidenceTopics().catch(() => [] as TopicConfidence[]),
  ]);
  return buildTutorSuggestions(courses, aggregate, confidences);
};
