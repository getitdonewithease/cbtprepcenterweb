import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Bookmark
} from 'lucide-react';
import { ReviewQuestion } from '../types/practiceTypes';
import MathContent from './MathContent';

interface QuestionReviewCardProps {
  question: ReviewQuestion;
  questionNumber: number;
  totalQuestions: number;
  onSave: () => void;
  saving: boolean;
  showSolution?: boolean;
  onToggleSolution?: () => void;
}

const QuestionReviewCard: React.FC<QuestionReviewCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onSave,
  saving,
  showSolution,
  onToggleSolution,
}) => {
  // Helper to validate image URLs
  const isValidImageUrl = (url: string | null | undefined): url is string => {
    return (
      typeof url === 'string' &&
      url.trim().length > 0 &&
      url.toLowerCase() !== 'null' &&
      url.toLowerCase() !== 'undefined'
    );
  };

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
    const baseClasses = "flex items-start gap-3 rounded-[10px] border-[0.5px] p-4 transition-colors";
    
    switch (status) {
      case 'correct':
        return `${baseClasses} border-[#cfe5d6] bg-[#f5fbf7] text-[#245c39]`;
      case 'incorrect':
        return `${baseClasses} border-[#ebd0cd] bg-[#fff7f6] text-[#87342f]`;
      default:
        return `${baseClasses} border-[#e8e8e5] bg-white text-[#444] hover:bg-[#fafafa]`;
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-4">
        {question.section && (
          <MathContent
            content={question.section}
            className="mb-4 text-[13px] font-medium leading-6 text-[#888]"
          />
        )}
        <MathContent content={question.text} className="text-[16px] leading-8 text-[#222]" />
        
        {/* Question Image */}
        {isValidImageUrl(question.imageUrl) && (
          <div className="flex justify-center">
            <img 
              src={question.imageUrl} 
              alt="Question" 
              className="h-auto max-w-full rounded-[10px] border-[0.5px] border-[#e8e8e5]"
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Options */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]">Options</h3>
        {question.options.map((option, index) => (
          <div
            key={index}
            className={getOptionClassName(index)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-current text-[13px] font-medium">
                {question.optionAlphas?.[index] || optionLabels[index]}
              </div>
              
              <div className="flex-1 min-w-0">
                <MathContent content={option} inline className="text-[14px] leading-7" />
                
                {/* Option Image */}
                {isValidImageUrl(question.optionImages?.[index]) && (
                  <div className="mt-2">
                    <img 
                      src={question.optionImages[index]} 
                      alt={`Option ${optionLabels[index]}`}
                      className="h-auto max-w-full rounded-[8px] border-[0.5px] border-[#e8e8e5]"
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
      
      <div className="space-y-3 rounded-[10px] border-[0.5px] border-[#e8e8e5] bg-[#fafafa] p-4">
        <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]">Answer summary</h4>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#888]">Your answer</span>
            {question.userAnswer !== undefined ? (
              <Badge variant="outline" className="rounded-[6px] border-[#ddd] bg-white text-[#555]">
                {question.optionAlphas?.[question.userAnswer] || optionLabels[question.userAnswer]}
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-[6px] border-[#e0d3b0] bg-white text-[#8a6b28]">
                Not Attempted
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#888]">Correct answer</span>
            <Badge variant="outline" className="rounded-[6px] border-[#cfe5d6] bg-white text-[#287245]">
              {question.optionAlphas?.[question.correctAnswer || 0] || optionLabels[question.correctAnswer || 0]}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#888]">Result</span>
            {question.isCorrect ? (
              <Badge className="rounded-[6px] border-[#cfe5d6] bg-[#f5fbf7] text-[#287245] shadow-none">
                <CheckCircle className="h-3 w-3 mr-1" />
                Correct
              </Badge>
            ) : question.userAnswer !== undefined ? (
              <Badge className="rounded-[6px] border-[#ebd0cd] bg-[#fff7f6] text-[#b6423b] shadow-none">
                <XCircle className="h-3 w-3 mr-1" />
                Incorrect
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-[6px] border-[#e0d3b0] bg-white text-[#8a6b28]">
                Not Attempted
              </Badge>
            )}
          </div>
        </div>
      </div>

  {/* Action Buttons */}
  <div className="flex items-center justify-between gap-2">
    <div>
      <Button
        variant={showSolution ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleSolution}
        className="rounded-[8px] border-[0.5px] border-[#e4e4e1] bg-white text-[13px] text-[#666] shadow-none hover:bg-[#fafafa]"
      >
        {showSolution ? "Hide Solution" : "View Solution"}
      </Button>
    </div>
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        disabled={saving || question.isSaved}
        className={`rounded-[8px] border-[0.5px] shadow-none ${
          question.isSaved
            ? 'border-[#cfe5d6] bg-[#f5fbf7] text-[#287245]'
            : 'border-[#e4e4e1] bg-white text-[#666] hover:bg-[#fafafa]'
        }`}
      >
        <Bookmark className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : question.isSaved ? 'Saved' : 'Save'}
      </Button>
    </div>
  </div>
    </div>
  );
};

export default QuestionReviewCard; 
