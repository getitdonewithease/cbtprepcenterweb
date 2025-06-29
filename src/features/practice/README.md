# Practice Feature - Test Review

This feature provides comprehensive test review functionality for CBT (Computer-Based Test) sessions.

## Components

### TestReviewPage
The main test review page that displays:
- Performance overview with score, time, and statistics
- Question navigation with visual indicators for correct/incorrect answers
- Individual question review with detailed analysis
- Action buttons for saving questions and getting AI explanations

### QuestionReviewCard
Displays individual questions with:
- Question text and images
- All options with visual highlighting:
  - Green for correct answers
  - Red for incorrect user answers
  - Neutral for other options
- Answer summary showing user's choice vs correct answer
- Save question and AI help buttons

### AIExplanationDialog
Modal dialog that provides:
- Detailed AI-powered explanations for questions
- Reasoning behind the correct answer
- Study tips and recommendations
- Question and options review in context

## Features

### Visual Answer Highlighting
- **Correct answers**: Highlighted in green with checkmark icon
- **Incorrect user answers**: Highlighted in red with X icon
- **Other options**: Neutral styling
- **Unattempted questions**: Yellow indicator

### Question Actions
- **Save Question**: Bookmark questions for later review
- **AI Help**: Get detailed explanations and study tips
- **Navigation**: Easy navigation between questions with visual indicators

### Performance Analytics
- Overall score and accuracy percentage
- Breakdown of correct, incorrect, and unattempted questions
- Time spent on the test
- Subject-wise performance

## API Integration

The feature integrates with the following API endpoints:
- `GET /api/v1/cbtsessions/{sessionId}/submissions/questions` - Fetch test results with user answers
- `POST /api/v1/ai/explain-question` - Get AI explanations
- `POST /api/v1/questions/{questionId}/save` - Save questions

## Navigation

Users can access the test review from:
1. **Test History**: Click "Review Test" button in test details
2. **Submission Success**: Click "Review Test Results" button
3. **Direct URL**: `/practice/review/{sessionId}`

## Usage

```tsx
import { TestReviewPage } from '@/features/practice';

// Navigate to test review
navigate(`/practice/review/${sessionId}`);
```

## Styling

The components use Tailwind CSS with:
- Consistent color scheme (green for correct, red for incorrect)
- Responsive design for mobile and desktop
- Accessible color contrasts
- Modern UI components from shadcn/ui 