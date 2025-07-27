import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Trash2, 
  Eye, 
  Calendar,
  Star,
  MoreVertical,
  GridIcon,
  List,
  BookMarked,
  MessageSquare,
  Share2,
  Copy as CopyIcon,
  Flag,
  RefreshCw,
  CheckCircle,
  XCircle,
  FileText,
  Save,
  Loader2
} from 'lucide-react';
import Layout from '@/components/common/Layout';
import { useSavedQuestions } from '../hooks/usePractice';
import { toast } from '@/components/ui/use-toast';
import { SavedQuestion } from '../types/practiceTypes';
import { saveQuestionNote, getQuestionNote } from '../api/practiceApi';

// Question View Dialog Component
interface QuestionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: SavedQuestion | null;
}

const QuestionViewDialog: React.FC<QuestionViewDialogProps> = ({
  open,
  onOpenChange,
  question,
}) => {
  if (!question) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Question Details
          </DialogTitle>
          <DialogDescription>
            Review this saved question and your answer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline">
                  {question.subject}
                </Badge>
                <Badge variant="outline">
                  {question.examType.toUpperCase()} {question.examYear}
                </Badge>
                {question.section && (
                  <Badge variant="outline" className="text-xs">
                    {question.section}
                  </Badge>
                )}
                <Badge 
                  variant={question.isCorrect ? "default" : "destructive"}
                  className={question.isCorrect ? "bg-green-100 text-green-800" : ""}
                >
                  {question.isCorrect ? "Correct" : "Incorrect"}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date Saved:</span>
                  <p className="font-medium">
                    {question.dateSaved ? new Date(question.dateSaved).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Question ID:</span>
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {question.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none text-sm leading-relaxed">
                {question.text}
              </div>

              {question.imageUrl && (
                <div className="flex justify-center">
                  <img 
                    src={question.imageUrl} 
                    alt="Question" 
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Answer Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const status = getOptionStatus(index);
                  const baseClasses = "flex items-start gap-3 p-3 rounded-lg border";
                  let optionClasses = baseClasses;
                  
                  switch (status) {
                    case 'correct':
                      optionClasses = `${baseClasses} bg-green-50 border-green-200`;
                      break;
                    case 'incorrect':
                      optionClasses = `${baseClasses} bg-red-50 border-red-200`;
                      break;
                    default:
                      optionClasses = `${baseClasses} bg-muted/30`;
                  }

                  return (
                    <div key={index} className={optionClasses}>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
                        {question.optionAlphas[index]}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          {option}
                        </div>
                      </div>
                      
                      {getOptionIcon(index)}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4 text-sm">
                  <span>Your Answer: 
                    <Badge variant="outline" className="ml-1">
                      {question.userAnswer !== undefined 
                        ? question.optionAlphas[question.userAnswer]
                        : 'Not Attempted'
                      }
                    </Badge>
                  </span>
                  <span>Correct Answer: 
                    <Badge variant="outline" className="ml-1 text-green-600 border-green-300">
                      {question.optionAlphas[question.correctAnswer]}
                    </Badge>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solution/Explanation */}
          {question.solution && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-sm leading-relaxed">
                  {question.solution}
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Note */}
          {question.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Your Personal Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-blue-900">
                    {question.note}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  💡 This is your personal study note for this question
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Note Dialog Component
interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: SavedQuestion | null;
  onNoteSaved: (questionId: string, note: string) => void;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
  open,
  onOpenChange,
  question,
  onNoteSaved,
}) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Load existing note when dialog opens
  useEffect(() => {
    if (open && question) {
      if (question.note) {
        setNote(question.note);
      } else {
        // Try to fetch note from API
        setInitialLoading(true);
        getQuestionNote(question.id)
          .then((existingNote) => {
            setNote(existingNote);
          })
          .catch((error) => {
            console.error('Failed to load note:', error);
            setNote('');
          })
          .finally(() => {
            setInitialLoading(false);
          });
      }
    } else {
      setNote('');
    }
  }, [open, question]);

  const handleSave = async () => {
    if (!question) return;
    
    setLoading(true);
    try {
      await saveQuestionNote(question.id, note);
      onNoteSaved(question.id, note);
      toast({
        title: "Note saved!",
        description: "Your note has been saved successfully.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNote(question?.note || '');
    onOpenChange(false);
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add Note
          </DialogTitle>
          <DialogDescription>
            Add a personal note to help you remember this question
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {question.subject}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {question.examType.toUpperCase()} {question.examYear}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {question.text}
            </p>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Note</label>
            {initialLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading existing note...</span>
              </div>
            ) : (
              <Textarea
                placeholder="Enter your note here... (e.g., key concepts, memory aids, study tips)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
                className="resize-none"
              />
            )}
          </div>

          {/* Character count */}
          <div className="text-xs text-muted-foreground text-right">
            {note.length}/1000 characters
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || initialLoading || note.length > 1000}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SavedQuestionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedQuestion, setSelectedQuestion] = useState<SavedQuestion | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [questionForNote, setQuestionForNote] = useState<SavedQuestion | null>(null);
  
  const { savedQuestions, loading, error, fetchSavedQuestions, removeQuestion } = useSavedQuestions();

  // Local state to track notes - with some dummy data for demonstration
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>(() => {
    // Initialize with dummy notes for the first 3 questions (regardless of their actual IDs)
    const dummyNotes: Record<string, string> = {};
    
    // Add notes for demonstration - these will be applied to the first few questions
    const sampleNotes = [
      'Remember: This is about gas exchange in the lungs. The alveoli are the key structures where oxygen and CO2 are exchanged. Focus on the respiratory system vs circulatory system distinction.',
      'Simple algebra: 2x + 5 = 17\nSubtract 5 from both sides: 2x = 12\nDivide by 2: x = 6\nAlways check by substituting back!',
      'Photosynthesis = Photo (light) + synthesis (making)\nKey equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2\nHappens in chloroplasts, specifically in the chlorophyll.',
      'Nigeria gained independence on October 1, 1960. Remember the date: 10/1/1960. This was after years of colonial rule by Britain. Key figures: Nnamdi Azikiwe, Tafawa Balewa.',
      'Derivative rules:\nPower rule: d/dx(x^n) = n·x^(n-1)\nFor f(x) = x³ + 2x² - 5x + 1:\n- d/dx(x³) = 3x²\n- d/dx(2x²) = 4x\n- d/dx(-5x) = -5\n- d/dx(1) = 0\nResult: 3x² + 4x - 5'
    ];
    
    // We'll assign these to actual question IDs when questions are loaded
    return dummyNotes;
  });

  // Effect to assign dummy notes to actual question IDs when they're loaded
  useEffect(() => {
    if (savedQuestions.length > 0 && Object.keys(questionNotes).length === 0) {
      const sampleNotes = [
        'Remember: This is about gas exchange in the lungs. The alveoli are the key structures where oxygen and CO2 are exchanged. Focus on the respiratory system vs circulatory system distinction.',
        'Simple algebra: 2x + 5 = 17\nSubtract 5 from both sides: 2x = 12\nDivide by 2: x = 6\nAlways check by substituting back!',
        'Photosynthesis = Photo (light) + synthesis (making)\nKey equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2\nHappens in chloroplasts, specifically in the chlorophyll.',
        'Nigeria gained independence on October 1, 1960. Remember the date: 10/1/1960. This was after years of colonial rule by Britain. Key figures: Nnamdi Azikiwe, Tafawa Balewa.',
        'Derivative rules:\nPower rule: d/dx(x^n) = n·x^(n-1)\nFor f(x) = x³ + 2x² - 5x + 1:\n- d/dx(x³) = 3x²\n- d/dx(2x²) = 4x\n- d/dx(-5x) = -5\n- d/dx(1) = 0\nResult: 3x² + 4x - 5'
      ];

      const newNotes: Record<string, string> = {};
      savedQuestions.slice(0, sampleNotes.length).forEach((question, index) => {
        newNotes[question.id] = sampleNotes[index];
      });
      
      setQuestionNotes(newNotes);
    }
  }, [savedQuestions]);

  // Filter questions based on search and filters
  const filteredQuestions = savedQuestions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || question.subject.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  // Get unique values for filters
  const subjects = [...new Set(savedQuestions.map(q => q.subject))];

  // Calculate stats
  const totalQuestions = savedQuestions.length;
  const correctAnswers = savedQuestions.filter(q => q.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      await removeQuestion(questionId);
      toast({
        title: "Success",
        description: "Question removed from saved questions",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove question",
        variant: "destructive",
      });
    }
  };

  const handleViewQuestion = (questionId: string) => {
    const question = savedQuestions.find(q => q.id === questionId);
    if (question) {
      // Include any local note state
      const questionWithNote = {
        ...question,
        note: questionNotes[questionId] || question.note
      };
      console.log('Question with note:', questionWithNote.note); // Debug log
      setSelectedQuestion(questionWithNote);
      setDialogOpen(true);
    }
  };

  const handleCopyQuestion = async (questionId: string) => {
    const question = savedQuestions.find(q => q.id === questionId);
    if (!question) return;

    const formattedText = `
📚 SAVED QUESTION

Subject: ${question.subject}
Exam: ${question.examType.toUpperCase()} ${question.examYear}
${question.section ? `Section: ${question.section}` : ''}

❓ Question:
${question.text}

📝 Options:
${question.options.map((option, index) => 
  `${question.optionAlphas[index]}. ${option}`
).join('\n')}

✅ Correct Answer: ${question.optionAlphas[question.correctAnswer]}
${question.userAnswer !== undefined 
  ? `🎯 Your Answer: ${question.optionAlphas[question.userAnswer]} ${question.isCorrect ? '(Correct ✓)' : '(Incorrect ✗)'}`
  : '🎯 Your Answer: Not Attempted'
}

${question.solution ? `💡 Solution:\n${question.solution}` : ''}

📅 Saved on: ${question.dateSaved ? new Date(question.dateSaved).toLocaleDateString() : 'Unknown'}
`.trim();

    try {
      await navigator.clipboard.writeText(formattedText);
      toast({
        title: "Copied!",
        description: "Question copied to clipboard",
      });
    } catch (error) {
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = formattedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copied!",
        description: "Question copied to clipboard",
      });
    }
  };

  const handleAddNote = (questionId: string) => {
    const question = savedQuestions.find(q => q.id === questionId);
    if (question) {
      // Include the note from local state if available
      const questionWithNote = {
        ...question,
        note: questionNotes[questionId] || question.note
      };
      setQuestionForNote(questionWithNote);
      setNoteDialogOpen(true);
    }
  };

  const handleNoteSaved = (questionId: string, note: string) => {
    // Update local state with the new note
    setQuestionNotes(prev => ({
      ...prev,
      [questionId]: note
    }));
  };

  const handleRefresh = async () => {
    try {
      await fetchSavedQuestions();
      toast({
        title: "Success", 
        description: "Saved questions refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh saved questions",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (error) {
    return (
      <Layout title="Saved Questions">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Saved Questions">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookMarked className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Answered Correctly</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">{loading ? '...' : accuracy}%</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center">
                <Button 
                  onClick={handleRefresh} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Questions Grid/List */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Loading saved questions...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your saved questions.</p>
            </CardContent>
          </Card>
        ) : filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved questions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedSubject !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Start saving questions from your practice tests to see them here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{question.subject}</Badge>
                        <Badge variant="outline">{question.examType.toUpperCase()} {question.examYear}</Badge>
                        {question.section && (
                          <Badge variant="outline" className="text-xs">{question.section}</Badge>
                        )}
                        {(questionNotes[question.id] || question.note) && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Note
                          </Badge>
                        )}
                      </div>
                      <CardTitle 
                        className="text-base leading-relaxed line-clamp-2"
                      >
                        {question.text}
                      </CardTitle>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewQuestion(question.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddNote(question.id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {questionNotes[question.id] || question.note ? 'Edit Note' : 'Add Note'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* TODO: Share logic */}}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyQuestion(question.id)}>
                          <CopyIcon className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* TODO: Report issue logic */}}>
                          <Flag className="h-4 w-4 mr-2 text-red-600" />
                          Report Issue
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemoveQuestion(question.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove from Saved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Answer Status */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Answer:</span>
                      <div className="flex items-center gap-2">
                        {question.userAnswer !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {question.optionAlphas[question.userAnswer]}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={question.isCorrect 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                          }
                        >
                          {question.isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Date Saved */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Date Saved:</span>
                      <span>{question.dateSaved ? new Date(question.dateSaved).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Question View Dialog */}
      <QuestionViewDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        question={selectedQuestion}
      />

      {/* Note Dialog */}
      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        question={questionForNote}
        onNoteSaved={handleNoteSaved}
      />
    </Layout>
  );
};

export default SavedQuestionsPage; 