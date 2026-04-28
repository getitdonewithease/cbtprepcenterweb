import React, { useEffect, useState } from 'react';
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
import SimpleMathEditor from '@/components/ui/simple-math-editor';
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
  BookOpen,
  Trash2,
  Eye,
  Star,
  MoreVertical,
  GridIcon,
  List,
  BookMarked,
  Bookmark,
  MessageSquare,
  Share2,
  Copy as CopyIcon,
  Flag,
  RefreshCw,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
  Percent,
} from 'lucide-react';
import Layout from '@/components/common/Layout';
import { useSavedQuestions } from '../hooks/useSavedQuestions';
import { notify } from '@/core/notifications/notify';
import { SavedQuestion } from '../types/savedQuestionsTypes';
import { saveQuestionNote } from '../api/savedQuestionsApi';
import { renderFormattedNote } from '@/features/saved-questions/utils/noteFormatting';

const orange = 'hsl(var(--brand-orange))';

interface StatsCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label }) => {
  return (
    <div className="min-w-0 flex-1 px-4 py-4 sm:px-5">
      <div
        className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'hsl(25 95% 53% / 0.12)', color: orange }}
      >
        {icon}
      </div>
      <p className="text-2xl font-black tabular-nums leading-none" style={{ color: orange }}>
        {value}
      </p>
      <p className="mt-1.5 truncate text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

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

    if (isCorrect) return 'correct';
    if (isUserAnswer) return 'incorrect';
    return 'neutral';
  };

  const getOptionIcon = (optionIndex: number) => {
    const isCorrect = optionIndex === question.correctAnswer;
    const isUserAnswer = optionIndex === question.userAnswer;

    if (isCorrect) return <CheckCircle className="h-4 w-4" style={{ color: orange }} />;
    if (isUserAnswer) return <XCircle className="h-4 w-4 text-destructive" />;
    return null;
  };

  const userAnswerLabel =
    question.userAnswer !== undefined
      ? question.optionAlphas[question.userAnswer]
      : 'Not Attempted';

  const savedDate = question.dateSaved
    ? new Date(question.dateSaved).toLocaleDateString()
    : 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 h-1 w-16 rounded-full" style={{ backgroundColor: orange }} />
          <DialogTitle className="text-xl font-black">Question Details</DialogTitle>
          <DialogDescription>Review this saved question and your answer.</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-card">
          <div className="space-y-5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{question.subject}</Badge>
              <Badge variant="outline">
                {question.examType.toUpperCase()} {question.examYear}
              </Badge>
              {question.section ? <Badge variant="outline">{question.section}</Badge> : null}
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                style={
                  question.isCorrect
                    ? {
                        backgroundColor: 'hsl(25 95% 53% / 0.12)',
                        borderColor: 'hsl(25 95% 53% / 0.35)',
                        color: 'hsl(25 80% 38%)',
                      }
                    : undefined
                }
              >
                {question.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                Date Saved: <span className="font-medium text-foreground">{savedDate}</span>
              </p>
              <p>
                Question ID: <span className="font-mono text-xs text-foreground">{question.id}</span>
              </p>
            </div>

            <Separator />

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: orange }}>
                Question
              </h3>
              <div className="prose max-w-none text-sm leading-relaxed">{question.text}</div>

              {question.imageUrl ? (
                <div className="flex justify-center">
                  <img
                    src={question.imageUrl}
                    alt="Question"
                    className="h-auto max-h-[300px] max-w-full rounded-lg border"
                  />
                </div>
              ) : null}
            </section>

            <Separator />

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: orange }}>
                Answer Options
              </h3>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const status = getOptionStatus(index);
                  const baseClasses = 'flex items-start gap-3 rounded-lg border px-3 py-3';
                  let optionClasses = `${baseClasses} bg-muted/30`;
                  let optionStyle: React.CSSProperties | undefined;

                  if (status === 'correct') {
                    optionClasses = baseClasses;
                    optionStyle = {
                      backgroundColor: 'hsl(25 95% 53% / 0.1)',
                      borderColor: 'hsl(25 95% 53% / 0.35)',
                    };
                  }

                  if (status === 'incorrect') {
                    optionClasses = `${baseClasses} border-destructive/40 bg-destructive/10`;
                  }

                  return (
                    <div key={index} className={optionClasses} style={optionStyle}>
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                        {question.optionAlphas[index]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">{option}</div>
                      </div>
                      {getOptionIcon(index)}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <p>
                    Your Answer: <span className="font-semibold text-foreground">{userAnswerLabel}</span>
                  </p>
                  <p>
                    Correct Answer:{' '}
                    <span className="font-semibold text-foreground">
                      {question.optionAlphas[question.correctAnswer]}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            {question.solution ? (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: orange }}
                  >
                    <BookOpen className="h-4 w-4" />
                    Solution
                  </h3>
                  <div className="prose max-w-none text-sm leading-relaxed">{question.solution}</div>
                </section>
              </>
            ) : null}

            {question.note ? (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: orange }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Personal Note
                  </h3>
                  <div
                    className="rounded-lg border px-4 py-3"
                    style={{
                      backgroundColor: 'hsl(25 95% 53% / 0.08)',
                      borderColor: 'hsl(25 95% 53% / 0.25)',
                    }}
                  >
                    <div
                      className="text-sm leading-relaxed text-foreground"
                      dangerouslySetInnerHTML={{ __html: renderFormattedNote(question.note || '') }}
                    />
                  </div>
                </section>
              </>
            ) : null}
          </div>
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

  useEffect(() => {
    if (open && question) {
      setNote(question.note || '');
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
      notify.success({ title: 'Note saved!', description: 'Your note has been saved successfully.' });
      onOpenChange(false);
    } catch (error: any) {
      notify.error({ title: 'Error', description: error.message || 'Failed to save note' });
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
          <div className="mb-1 h-1 w-16 rounded-full" style={{ backgroundColor: orange }} />
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <MessageSquare className="h-5 w-5" style={{ color: orange }} />
            {question.note ? 'Edit Note' : 'Add Note'}
          </DialogTitle>
          <DialogDescription>
            Add a personal note to help you remember this question.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-4 py-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {question.subject}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {question.examType.toUpperCase()} {question.examYear}
              </Badge>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{question.text}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Note</label>
            <SimpleMathEditor
              value={note}
              onChange={setNote}
              placeholder="Enter your note here... Use **bold**, *italic*, x^2 for superscripts, H_2 for subscripts, and mathematical symbols from the toolbar."
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || note.length > 1000}
            className="min-w-[110px] text-white"
            style={{ backgroundColor: orange }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);

  const { savedQuestions, loading, error, fetchSavedQuestions, removeQuestion } = useSavedQuestions();

  const filteredQuestions = savedQuestions.filter((question) => {
    const matchesSearch =
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === 'all' || question.subject.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  const subjects = [...new Set(savedQuestions.map((q) => q.subject))];

  const totalQuestions = savedQuestions.length;
  const correctAnswers = savedQuestions.filter((q) => q.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const handleRemoveQuestion = async (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteConfirmOpen(true);
  };

  const confirmRemoveQuestion = async () => {
    if (!questionToDelete) return;

    try {
      await removeQuestion(questionToDelete);
      notify.success({ title: 'Success', description: 'Question removed from saved questions' });
      setDeleteConfirmOpen(false);
      setQuestionToDelete(null);
    } catch (removeError) {
      notify.error({ title: 'Error', description: 'Failed to remove question' });
    }
  };

  const handleViewQuestion = (questionId: string) => {
    const question = savedQuestions.find((q) => q.id === questionId);
    if (question) {
      setSelectedQuestion(question);
      setDialogOpen(true);
    }
  };

  const handleCopyQuestion = async (questionId: string) => {
    const question = savedQuestions.find((q) => q.id === questionId);
    if (!question) return;

    const formattedText = `
📚 SAVED QUESTION

Subject: ${question.subject}
Exam: ${question.examType.toUpperCase()} ${question.examYear}
${question.section ? `Section: ${question.section}` : ''}

❓ Question:
${question.text}

📝 Options:
${question.options.map((option, index) => `${question.optionAlphas[index]}. ${option}`).join('\n')}

✅ Correct Answer: ${question.optionAlphas[question.correctAnswer]}
${
  question.userAnswer !== undefined
    ? `🎯 Your Answer: ${question.optionAlphas[question.userAnswer]} ${question.isCorrect ? '(Correct ✓)' : '(Incorrect ✗)'}`
    : '🎯 Your Answer: Not Attempted'
}

${question.solution ? `💡 Solution:\n${question.solution}` : ''}

📅 Saved on: ${question.dateSaved ? new Date(question.dateSaved).toLocaleDateString() : 'Unknown'}
`.trim();

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopiedQuestionId(questionId);
      notify.success({ title: 'Copied!', description: 'Question copied to clipboard' });
    } catch (copyError) {
      const textArea = document.createElement('textarea');
      textArea.value = formattedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedQuestionId(questionId);
      notify.success({ title: 'Copied!', description: 'Question copied to clipboard' });
    }
  };

  const handleAddNote = (questionId: string) => {
    const question = savedQuestions.find((q) => q.id === questionId);
    if (question) {
      setQuestionForNote(question);
      setNoteDialogOpen(true);
    }
  };

  const handleNoteSaved = (_questionId: string, _note: string) => {
    fetchSavedQuestions();
  };

  const handleRefresh = async () => {
    try {
      await fetchSavedQuestions();
      notify.success({ title: 'Success', description: 'Saved questions refreshed' });
    } catch (refreshError) {
      notify.error({ title: 'Error', description: 'Failed to refresh saved questions' });
    }
  };

  useEffect(() => {
    if (!copiedQuestionId) return;
    const timeout = setTimeout(() => setCopiedQuestionId(null), 1800);
    return () => clearTimeout(timeout);
  }, [copiedQuestionId]);

  if (error) {
    return (
      <Layout title="Saved Questions">
        <div className="rounded-xl border bg-background p-8 text-center">
          <p className="mb-4 text-sm text-destructive">Error: {error}</p>
          <Button onClick={handleRefresh} className="text-white" style={{ backgroundColor: orange }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Saved Questions">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 62% 38% at 0% 0%, hsl(25,95%,53%), transparent)',
            opacity: 0.1,
          }}
        />

        <div className="relative space-y-6">
          {/* <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: orange }}>
              Revision Library
            </p>
            <h2 className="text-3xl font-black tracking-tight">Saved Questions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisit key questions, refine your notes, and track your accuracy over time.
            </p>
          </section> */}

          <div className="overflow-hidden rounded-xl border bg-background/90">
            <div className="flex items-stretch divide-x divide-border">
              <StatsCard
                icon={<Bookmark className="h-5 w-5" />}
                value={loading ? '...' : totalQuestions}
                label="Total Saved"
              />
              <StatsCard
                icon={<Star className="h-5 w-5" />}
                value={loading ? '...' : correctAnswers}
                label="Answered Correctly"
              />
              <StatsCard
                icon={<Percent className="h-5 w-5" />}
                value={loading ? '...' : `${accuracy}%`}
                label="Accuracy"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by question or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                <div className="flex rounded-lg border border-border p-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-md"
                    style={
                      viewMode === 'grid'
                        ? {
                            backgroundColor: 'hsl(25 95% 53% / 0.15)',
                            color: 'hsl(25 80% 38%)',
                          }
                        : undefined
                    }
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-md"
                    style={
                      viewMode === 'list'
                        ? {
                            backgroundColor: 'hsl(25 95% 53% / 0.15)',
                            color: 'hsl(25 80% 38%)',
                          }
                        : undefined
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border bg-background p-12 text-center">
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin" style={{ color: orange }} />
              <h3 className="mb-2 text-lg font-semibold">Loading saved questions...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your saved questions.</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-xl border bg-background p-12 text-center">
              <div
                className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'hsl(25 95% 53% / 0.1)' }}
              >
                <BookMarked className="h-7 w-7" style={{ color: orange }} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No saved questions found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || selectedSubject !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Start saving questions from your practice tests to see them here.'}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                  : 'space-y-3'
              }
            >
              {filteredQuestions.map((question) => {
                const savedDate = question.dateSaved
                  ? new Date(question.dateSaved).toLocaleDateString()
                  : 'Unknown';
                const userAnswerLabel =
                  question.userAnswer !== undefined
                    ? question.optionAlphas[question.userAnswer]
                    : 'Not Attempted';

                return (
                  <article
                    key={question.id}
                    className="group rounded-xl border bg-card/60 p-4 transition-colors hover:bg-card sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="rounded-full">
                            {question.subject}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            {question.examType.toUpperCase()} {question.examYear}
                          </Badge>
                          {question.note ? (
                            <span
                              className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: 'hsl(25 95% 53% / 0.12)',
                                borderColor: 'hsl(25 95% 53% / 0.3)',
                                color: 'hsl(25 80% 38%)',
                              }}
                            >
                              Note added
                            </span>
                          ) : null}
                        </div>

                        <h3 className="line-clamp-3 text-base font-semibold leading-relaxed">{question.text}</h3>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-1 h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewQuestion(question.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddNote(question.id)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {question.note ? 'Edit Note' : 'Add Note'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { /* TODO: Share logic */ }}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyQuestion(question.id)}>
                            <CopyIcon className="mr-2 h-4 w-4" />
                            {copiedQuestionId === question.id ? 'Copied' : 'Copy'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { /* TODO: Report issue logic */ }}>
                            <Flag className="mr-2 h-4 w-4 text-destructive" />
                            Report Issue
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveQuestion(question.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove from Saved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 border-t border-border/70 pt-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Your answer:</span>
                          <span className="font-semibold">{userAnswerLabel}</span>
                          <span
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                            style={
                              question.isCorrect
                                ? {
                                    backgroundColor: 'hsl(25 95% 53% / 0.12)',
                                    borderColor: 'hsl(25 95% 53% / 0.35)',
                                    color: 'hsl(25 80% 38%)',
                                  }
                                : undefined
                            }
                          >
                            {question.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">Saved {savedDate}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <QuestionViewDialog open={dialogOpen} onOpenChange={setDialogOpen} question={selectedQuestion} />

      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        question={questionForNote}
        onNoteSaved={handleNoteSaved}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-base font-semibold">Remove Saved Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this question from your saved questions? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setQuestionToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveQuestion} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SavedQuestionsPage;
