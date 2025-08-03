# Saved Questions Feature

This feature handles all functionality related to saved questions that users have bookmarked during their practice tests.

## Structure

```
saved-questions/
├── api/                    # API calls for saved questions
│   └── savedQuestionsApi.ts
├── hooks/                  # React hooks for saved questions
│   └── useSavedQuestions.ts
├── types/                  # TypeScript type definitions
│   └── savedQuestionsTypes.ts
├── ui/                     # UI components
│   └── SavedQuestionsPage.tsx
├── index.ts               # Main exports
└── README.md              # This file
```

## Components

### SavedQuestionsPage
The main page component that displays all saved questions with:
- Grid and list view modes
- Search and filtering capabilities
- Question details modal
- Note management for questions
- Statistics overview (total saved, accuracy, etc.)

## Hooks

### useSavedQuestions
A custom hook that provides:
- Fetching saved questions from the API
- Removing questions from saved list
- Loading and error states
- Real-time updates when questions are modified

## API Functions

- `getSavedQuestions()` - Fetches all saved questions for the user
- `removeSavedQuestion(questionId)` - Removes a question from saved list
- `saveQuestionNote(questionId, note)` - Saves a note for a question
- `getQuestionNote(questionId)` - Retrieves a note for a question
- `deleteQuestionNote(questionId)` - Deletes a note for a question

## Types

### SavedQuestion
The main type representing a saved question with all its metadata:
- Question content and options
- User's answer and correct answer
- Subject, exam type, and year information
- Personal notes
- Date saved
- Solution/explanation (if available)

### Other Types
- `SavedQuestionApiResponse` - Raw API response format
- `SavedQuestionOption` - Individual option in a question
- `QuestionNote` - Note structure
- `NoteApiResponse` - Note API response format

## Usage

```typescript
import { SavedQuestionsPage, useSavedQuestions } from '@/features/saved-questions';

// Use the hook in a component
const MyComponent = () => {
  const { savedQuestions, loading, error, fetchSavedQuestions, removeQuestion } = useSavedQuestions();
  
  // Component logic...
};

// Use the page component in routing
<Route path="/saved-questions" element={<SavedQuestionsPage />} />
```

## Integration

This feature integrates with:
- **Authentication**: Requires user authentication for all operations
- **Practice Feature**: Questions are saved from practice sessions
- **UI Components**: Uses shared UI components from the design system
- **Toast Notifications**: Provides user feedback for operations 