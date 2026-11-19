import {
  CHAT_QUIZ_OPTION_KEYS,
  type ChatQuizOption,
  type ChatQuizOptionKey,
  type ChatQuizQuestion,
  type ChatQuizSelectedAnswers,
  type ChatQuizSubmission,
} from "../types/chatQuizTypes";

const stripMarkdownFormatting = (line: string): string =>
  line
    .replace(/^\s*[-*+]\s+/, "")
    .replace(/^\s*>\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .trim();

const EXPLICIT_QUESTION_START_REGEX =
  /^(?:\*\*|__)?(?:Q(?:uestion)?\s*\d+|Q)\s*[:.)-]/i;
const OPTION_LINE_REGEX = /^(?:\(([A-D])\)|([A-D])[).:])\s*(.*)$/i;
const ANSWER_LINE_REGEX =
  /^(?:correct\s+)?answer\s*[:=-]\s*\**([A-D])\b/i;
const SUBMITTED_HEADER_REGEX =
  /^(?:Quiz Results\s*\(\d+\/\d+\)|My Quiz Answers)\s*:/i;
const SUBMITTED_LINE_REGEX = /^Q(\d+)\s*:\s*([A-D])\b/i;

const isValidOptionKey = (value: string): value is ChatQuizOptionKey =>
  CHAT_QUIZ_OPTION_KEYS.includes(value as ChatQuizOptionKey);

export const hasUnclosedQuizFence = (content: string): boolean => {
  const openMatch = content.match(/```(?:quiz|question)\b/gi);
  if (!openMatch) {
    return false;
  }

  // Find the last ```quiz or ```question fence and check if there is a closing ``` after it
  const lastQuizFenceIndex = Math.max(
    content.lastIndexOf("```quiz"),
    content.lastIndexOf("```question"),
    content.lastIndexOf("```QUIZ"),
    content.lastIndexOf("```QUESTION"),
  );

  if (lastQuizFenceIndex < 0) {
    return false;
  }

  const afterOpenFence = content.slice(lastQuizFenceIndex + 7);
  return !afterOpenFence.includes("```");
};

export const matchOptionLine = (
  rawLine: string,
): { key: ChatQuizOptionKey; text: string } | null => {
  const cleaned = stripMarkdownFormatting(rawLine);
  const match = cleaned.match(OPTION_LINE_REGEX);
  if (!match) {
    return null;
  }

  const candidateKey = (match[1] ?? match[2] ?? "").toUpperCase();
  if (!isValidOptionKey(candidateKey)) {
    return null;
  }

  const rawWithoutBullet = rawLine.trim().replace(/^[-*+]\s+/, "");
  const textMatch = rawWithoutBullet.match(
    /^(?:\*\*|__)?(?:\([A-D]\)|[A-D][).:])(?:\*\*|__)?\s*(.*)$/i,
  );
  const preservedText = (textMatch ? textMatch[1] : match[3]).trim();

  return {
    key: candidateKey,
    text: preservedText,
  };
};

export const matchAnswerLine = (rawLine: string): ChatQuizOptionKey | null => {
  const cleaned = stripMarkdownFormatting(rawLine);
  const match = cleaned.match(ANSWER_LINE_REGEX);
  if (!match) {
    return null;
  }

  const candidateKey = match[1].toUpperCase();
  return isValidOptionKey(candidateKey) ? candidateKey : null;
};

const cleanQuestionPrefix = (rawLine: string): string => {
  const trimmed = rawLine.trim();
  const strippedBoldPrefix = trimmed.replace(
    /^(?:\*\*|__)?(?:Q(?:uestion)?\s*\d*|\d+[).])(?:\*\*|__)?\s*[:.-]?\s*/i,
    "",
  );
  return strippedBoldPrefix.trim();
};

/**
 * Splits lines where SSE streaming may have concatenated options or ANSWER: onto the same line.
 */
const splitMergedQuizLines = (rawChunk: string): string[] => {
  const normalized = rawChunk
    .replace(/\s+(?=(?:\*\*|__)?[A-D][).]\s+)/g, "\n")
    .replace(/\s+(?=(?:\*\*|__)?(?:Correct\s+)?ANSWER\s*[:=-]\s*[A-D]\b)/gi, "\n");

  return normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

const parseSingleQuestionChunk = (
  rawChunk: string,
  index: number,
): ChatQuizQuestion | null => {
  const lines = splitMergedQuizLines(rawChunk);

  if (lines.length === 0) {
    return null;
  }

  const questionLines: string[] = [];
  const optionsMap = new Map<ChatQuizOptionKey, string[]>();
  let currentOptionKey: ChatQuizOptionKey | null = null;
  let answer: ChatQuizOptionKey | null = null;

  for (const line of lines) {
    const matchedAnswer = matchAnswerLine(line);
    if (matchedAnswer) {
      answer = matchedAnswer;
      currentOptionKey = null;
      continue;
    }

    const matchedOption = matchOptionLine(line);
    if (matchedOption) {
      currentOptionKey = matchedOption.key;
      optionsMap.set(
        matchedOption.key,
        matchedOption.text ? [matchedOption.text] : [],
      );
      continue;
    }

    if (currentOptionKey) {
      const existingLines = optionsMap.get(currentOptionKey) ?? [];
      existingLines.push(line);
      optionsMap.set(currentOptionKey, existingLines);
      continue;
    }

    const cleanedPrefix =
      questionLines.length === 0 ? cleanQuestionPrefix(line) : line;
    if (cleanedPrefix) {
      questionLines.push(cleanedPrefix);
    }
  }

  const questionText = questionLines.join("\n").trim();
  const options: ChatQuizOption[] = CHAT_QUIZ_OPTION_KEYS.flatMap((key) => {
    const segments = optionsMap.get(key);
    if (!segments) {
      return [];
    }
    const text = segments.join("\n").trim();
    return text ? [{ key, text }] : [];
  });

  if (options.length === 0) {
    return null;
  }

  return {
    index,
    question: questionText,
    options,
    answer,
  };
};

export const parseChatQuizBlock = (rawContent: string): ChatQuizQuestion[] => {
  if (!rawContent || !rawContent.trim()) {
    return [];
  }

  const rawChunks = rawContent.split(/^\s*---+\s*$/m);
  const parsedQuestions: ChatQuizQuestion[] = [];

  for (const chunk of rawChunks) {
    const parsed = parseSingleQuestionChunk(chunk, parsedQuestions.length);
    if (parsed) {
      parsedQuestions.push(parsed);
    }
  }

  return parsedQuestions;
};

/**
 * Automatically detects unfenced multiple-choice questions (e.g. "Question 1: ... A) ... B) ... C) ... D) ...")
 * in completed markdown messages and wraps them into a ```quiz code block.
 */
export const normalizeQuizBlocksInMarkdown = (content: string): string => {
  if (!content || !content.trim()) {
    return content;
  }

  if (/```(?:quiz|question)\b/i.test(content)) {
    return content;
  }

  const lines = content.split(/\r?\n/);
  const optionLineIndices: number[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const opt = matchOptionLine(lines[i]);
    if (opt?.key === "A") {
      optionLineIndices.push(i);
    }
  }

  if (optionLineIndices.length === 0) {
    return content;
  }

  interface DetectedBlock {
    startLine: number;
    endLine: number;
    quizText: string;
  }

  const detectedBlocks: DetectedBlock[] = [];

  for (const aLineIndex of optionLineIndices) {
    const minSearchLine =
      detectedBlocks.length > 0
        ? detectedBlocks[detectedBlocks.length - 1].endLine + 1
        : 0;

    if (aLineIndex < minSearchLine) {
      continue;
    }

    const foundKeys = new Set<ChatQuizOptionKey>(["A"]);
    let endLine = aLineIndex;

    for (let j = aLineIndex + 1; j < lines.length; j += 1) {
      const line = lines[j];
      const trimmed = line.trim();

      if (!trimmed) {
        let nextNonEmpty = j + 1;
        while (nextNonEmpty < lines.length && !lines[nextNonEmpty].trim()) {
          nextNonEmpty += 1;
        }
        if (nextNonEmpty < lines.length) {
          const nextOpt = matchOptionLine(lines[nextNonEmpty]);
          const nextAns = matchAnswerLine(lines[nextNonEmpty]);
          if ((nextOpt && nextOpt.key !== "A") || nextAns !== null) {
            continue;
          }
        }
        break;
      }

      if (EXPLICIT_QUESTION_START_REGEX.test(trimmed)) {
        break;
      }

      const opt = matchOptionLine(trimmed);
      if (opt) {
        if (opt.key === "A" && foundKeys.size >= 2) {
          break;
        }
        foundKeys.add(opt.key);
        endLine = j;
        continue;
      }

      const ans = matchAnswerLine(trimmed);
      if (ans) {
        endLine = j;
        break;
      }

      if (foundKeys.size < 4) {
        endLine = j;
      } else {
        break;
      }
    }

    if (foundKeys.size < 2) {
      continue;
    }

    let startLine = aLineIndex;
    let cursor = aLineIndex - 1;

    while (cursor >= minSearchLine && !lines[cursor].trim()) {
      cursor -= 1;
    }

    while (cursor >= minSearchLine) {
      const candidate = lines[cursor].trim();
      if (!candidate) {
        if (
          cursor - 1 >= minSearchLine &&
          EXPLICIT_QUESTION_START_REGEX.test(lines[cursor - 1].trim())
        ) {
          startLine = cursor - 1;
          cursor -= 2;
        }
        break;
      }

      startLine = cursor;
      if (EXPLICIT_QUESTION_START_REGEX.test(candidate)) {
        break;
      }
      cursor -= 1;
    }

    const rawLinesForQuestion = lines.slice(startLine, endLine + 1);
    const formattedLines: string[] = [];
    let seenFirstQuestionLine = false;

    for (const rawLine of rawLinesForQuestion) {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        continue;
      }
      if (
        !seenFirstQuestionLine &&
        !matchOptionLine(trimmed) &&
        !matchAnswerLine(trimmed)
      ) {
        seenFirstQuestionLine = true;
        formattedLines.push(`Q: ${cleanQuestionPrefix(trimmed)}`);
      } else {
        formattedLines.push(trimmed);
      }
    }

    detectedBlocks.push({
      startLine,
      endLine,
      quizText: formattedLines.join("\n"),
    });
  }

  if (detectedBlocks.length === 0) {
    return content;
  }

  const mergedGroups: Array<{
    startLine: number;
    endLine: number;
    questions: string[];
  }> = [];

  for (const block of detectedBlocks) {
    const prevGroup = mergedGroups[mergedGroups.length - 1];
    if (prevGroup) {
      const linesBetween = lines
        .slice(prevGroup.endLine + 1, block.startLine)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !/^---+$/.test(l));

      if (linesBetween.length === 0) {
        prevGroup.endLine = block.endLine;
        prevGroup.questions.push(block.quizText);
        continue;
      }
    }

    mergedGroups.push({
      startLine: block.startLine,
      endLine: block.endLine,
      questions: [block.quizText],
    });
  }

  const outputLines: string[] = [];
  let lineCursor = 0;

  for (const group of mergedGroups) {
    if (group.startLine > lineCursor) {
      outputLines.push(...lines.slice(lineCursor, group.startLine));
    }

    outputLines.push("", "```quiz");
    outputLines.push(group.questions.join("\n---\n"));
    outputLines.push("```", "");

    lineCursor = group.endLine + 1;
  }

  if (lineCursor < lines.length) {
    outputLines.push(...lines.slice(lineCursor));
  }

  return outputLines.join("\n");
};

export const formatQuizSubmissionPrompt = (
  questions: ChatQuizQuestion[],
  selectedAnswers: ChatQuizSelectedAnswers,
): ChatQuizSubmission => {
  const total = questions.length;
  const hasAnswerKeys = questions.every((item) => item.answer !== null);
  let score = 0;

  const resultLines = questions.map((item, idx) => {
    const chosen = selectedAnswers[idx];
    const questionNumber = idx + 1;

    if (!hasAnswerKeys) {
      const chosenOption = item.options.find((opt) => opt.key === chosen);
      return chosenOption
        ? `Q${questionNumber}: ${chosen}) ${chosenOption.text}`
        : `Q${questionNumber}: ${chosen ?? "-"}`;
    }

    const isCorrect = Boolean(chosen && item.answer && chosen === item.answer);
    if (isCorrect) {
      score += 1;
      return `Q${questionNumber}: ${chosen} (Correct)`;
    }

    const expectedAnswer = item.answer ?? "?";
    return `Q${questionNumber}: ${chosen ?? "-"} (Incorrect, Answer: ${expectedAnswer})`;
  });

  const header = hasAnswerKeys
    ? `Quiz Results (${score}/${total}):`
    : `My Quiz Answers:`;

  const formattedPrompt = [header, ...resultLines].join("\n");

  return {
    score,
    total,
    formattedPrompt,
  };
};

export const parseSubmittedQuizResults = (
  messageContent: string,
): ChatQuizSelectedAnswers | null => {
  const trimmed = messageContent.trim();
  if (!SUBMITTED_HEADER_REGEX.test(trimmed)) {
    return null;
  }

  const lines = trimmed.split(/\r?\n/);
  const selectedAnswers: ChatQuizSelectedAnswers = {};
  let foundAny = false;

  for (const line of lines.slice(1)) {
    const match = line.trim().match(SUBMITTED_LINE_REGEX);
    if (!match) {
      continue;
    }

    const questionNumber = Number.parseInt(match[1], 10);
    const chosenKey = match[2].toUpperCase();

    if (
      Number.isFinite(questionNumber) &&
      questionNumber >= 1 &&
      isValidOptionKey(chosenKey)
    ) {
      selectedAnswers[questionNumber - 1] = chosenKey;
      foundAny = true;
    }
  }

  return foundAny ? selectedAnswers : null;
};
