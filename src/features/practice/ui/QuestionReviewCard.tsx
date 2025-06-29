import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  HelpCircle
} from 'lucide-react';
import { ReviewQuestion } from '../types/practiceTypes';

interface QuestionReviewCardProps {
  question: ReviewQuestion;
  questionNumber: number;
  totalQuestions: number;
  onSave: () => void;
  onAIExplanation: () => void;
  saving: boolean;
}

const QuestionReviewCard: React.FC<QuestionReviewCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onSave,
  onAIExplanation,
  saving,
}) => {
  const getOptionStatus = (optionIndex: number) => {
    const isCorrect = optionIndex === question.correctAnswer;
    const isUserAnswer = optionIndex === question.userAnswer;
    
    if (isCorrect) {
      return 'correct';
    } else if (isUserAnswer && !isCorrect) {
      return 'incorrect';
    }
    return 'neutral';
  };

  const getOptionIcon = (optionIndex: number) => {
    const isCorrect = optionIndex === question.correctAnswer;
    const isUserAnswer = optionIndex === question.userAnswer;
    
    if (isCorrect) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (isUserAnswer && !isCorrect) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getOptionClassName = (optionIndex: number) => {
    const status = getOptionStatus(optionIndex);
    const baseClasses = "flex items-start gap-3 p-4 rounded-lg border transition-colors";
    
    switch (status) {
      case 'correct':
        return `${baseClasses} bg-green-50 border-green-200 text-green-900`;
      case 'incorrect':
        return `${baseClasses} bg-red-50 border-red-200 text-red-900`;
      default:
        return `${baseClasses} bg-background border-border hover:bg-muted/50`;
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-4">
        <div className="prose max-w-none">
          <div 
            className="text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.text }}
          />
        </div>
        
        {/* Question Image */}
        {question.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={question.imageUrl} 
              alt="Question" 
              className="max-w-full h-auto rounded-lg border"
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Options */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Options:</h3>
        {question.options.map((option, index) => (
          <div
            key={index}
            className={getOptionClassName(index)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                {question.optionAlphas?.[index] || optionLabels[index]}
              </div>
              
              <div className="flex-1 min-w-0">
                <div 
                  className="text-base"
                  dangerouslySetInnerHTML={{ __html: option }}
                />
                
                {/* Option Image */}
                {question.optionImages?.[index] && (
                  <div className="mt-2">
                    <img 
                      src={question.optionImages[index]} 
                      alt={`Option ${optionLabels[index]}`}
                      className="max-w-full h-auto rounded border"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
              </div>
              
              {getOptionIcon(index)}
            </div>
          </div>
        ))}
      </div>

      {/* Answer Summary */}
      <Separator />
      
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold">Your Answer Summary:</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your Answer:</span>
            {question.userAnswer !== undefined ? (
              <Badge variant="outline">
                {question.optionAlphas?.[question.userAnswer] || optionLabels[question.userAnswer]}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                Not Attempted
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Correct Answer:</span>
            <Badge variant="outline" className="text-green-600 border-green-300">
              {question.optionAlphas?.[question.correctAnswer || 0] || optionLabels[question.correctAnswer || 0]}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Result:</span>
            {question.isCorrect ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Correct
              </Badge>
            ) : question.userAnswer !== undefined ? (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Incorrect
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                Not Attempted
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saving || question.isSaved}
          className={question.isSaved ? 'bg-green-50 border-green-200 text-green-700' : ''}
        >
          <Bookmark className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : question.isSaved ? 'Saved' : 'Save'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onAIExplanation}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          AI Help
        </Button>
      </div>
    </div>
  );
};

export default QuestionReviewCard; 