import { useEffect, useState } from "react";
import { buildTutorSuggestions, loadTutorSuggestions, type TutorSuggestion } from "../service/tutorSuggestionsService";

/**
 * Suggestions for the AI tutor's first screen. Loads only once the tutor is opened
 * (`isEnabled`) and the candidate's subjects are known, so pages that never open it make
 * no extra requests. Until the data arrives (or if it fails) the suggestions fall back to
 * the candidate's subjects. Results are kept per set of subjects: the tutor can open before
 * the profile loads (seen on phones), and suggestions built from no subjects must not stick.
 */
export const useTutorSuggestions = (courses: string[], isEnabled: boolean) => {
  const [loaded, setLoaded] = useState<{ key: string; suggestions: TutorSuggestion[] } | null>(null);
  const coursesKey = courses.join("|");
  const isCurrent = loaded?.key === coursesKey;

  useEffect(() => {
    if (!isEnabled || !coursesKey || isCurrent) return;
    let isLive = true;
    loadTutorSuggestions(coursesKey.split("|"))
      .then((suggestions) => {
        if (isLive) setLoaded({ key: coursesKey, suggestions });
      })
      .catch(() => undefined);
    return () => {
      isLive = false;
    };
  }, [isEnabled, coursesKey, isCurrent]);

  return isCurrent && loaded ? loaded.suggestions : buildTutorSuggestions(courses, [], []);
};
