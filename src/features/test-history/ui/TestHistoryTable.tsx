import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../../components/common/Layout';
import {
  Eye,
  Download,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  ChevronRight,
  XCircle,
  ClipboardList,
  BarChart3,
  Trophy,
  CheckCircle2,
  PlayCircle,
  Circle,
  Loader2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { Badge } from '../../../components/ui/badge';
import { toast } from '../../../components/ui/use-toast';
import { SectionAlertBanner } from '@/components/ui/section-alert-banner';
import { useTestHistory } from '../hooks/useTestHistory';
import { testHistoryApi } from '../api/testHistoryApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { TestRecord, TestSubject } from '../types/testHistoryTypes';
import { PracticeTestType } from '../../dashboard/types/dashboardTypes';
import NewTestDialog from '../../dashboard/ui/NewTestDialog';
import { useDashboardCards, usePrepareTest, useUserContext } from '@/features/dashboard';

const orange = 'hsl(var(--brand-orange))';

export function TestHistoryTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [isTestDetailsOpen, setIsTestDetailsOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null);
  const [preparingDialogOpen, setPreparingDialogOpen] = useState(true);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [testToCancel, setTestToCancel] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [exportHint, setExportHint] = useState<string | null>(null);

  const { items, totalPages, loading, error } = useTestHistory(currentPage, pageSize);
  const { user } = useUserContext();
  const { cards, cardsLoading, cardsError } = useDashboardCards();
  const {
    preparing,
    showPreparedDialog,
    prepareError,
    handlePrepareTest,
    handleGoToTest,
    setShowPreparedDialog,
    clearPrepareError,
  } = usePrepareTest();

  const navigate = useNavigate();

  const wasPreparing = useRef(false);
  useEffect(() => {
    if (wasPreparing.current && !preparing && !showPreparedDialog && !preparingDialogOpen) {
      toast({ title: 'Questions Ready!', description: 'Your practice test is ready to start.' });
    }
    wasPreparing.current = preparing;
  }, [preparing, showPreparedDialog, preparingDialogOpen]);

  const filteredTests = items
    .filter((test) => {
      if (filterStatus && test.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          test.subjects.some((subject) => subject.name.toLowerCase().includes(query)) ||
          test.date.includes(query) ||
          test.status.includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'score-desc') return b.score - a.score;
      if (sortBy === 'score-asc') return a.score - b.score;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const formatMetric = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return '--';
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '');
  };

  const kpiStats = [
    { icon: <ClipboardList className="h-4 w-4" />, value: cardsLoading ? '--' : formatMetric(cards?.numberOfTestCompleted), label: 'Total Tests' },
    { icon: <Trophy className="h-4 w-4" />, value: cardsLoading ? '--' : `${formatMetric(cards?.bestScorePercentage)}%`, label: 'Best Score' },
    { icon: <BarChart3 className="h-4 w-4" />, value: cardsLoading ? '--' : `${formatMetric(cards?.averageScore)}%`, label: 'Avg Score' },
    { icon: <CheckCircle2 className="h-4 w-4" />, value: cardsLoading ? '--' : `${formatMetric(cards?.averageSpeed)}s`, label: 'Avg. Speed' },
  ];

  const renderStatusBadge = (status: string) => {
    const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap';
    switch (status) {
      case 'submitted':
        return (
          <span className={`${base} border-green-200 bg-green-50 text-green-700`}>
            <CheckCircle2 className="h-3 w-3" /> Submitted
          </span>
        );
      case 'in-progress':
        return (
          <span
            className={base}
            style={{ backgroundColor: 'hsl(25 95% 53% / 0.1)', borderColor: 'hsl(25 95% 53% / 0.4)', color: 'hsl(25 80% 38%)' }}
          >
            <PlayCircle className="h-3 w-3" /> In Progress
          </span>
        );
      case 'not-started':
        return (
          <span className={`${base} border-border bg-muted text-muted-foreground`}>
            <Circle className="h-3 w-3" /> Not Started
          </span>
        );
      case 'cancelled':
        return (
          <span className={`${base} border-destructive/30 bg-destructive/10 text-destructive`}>
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className={`${base} border-border bg-muted text-muted-foreground`}>{status}</span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        day: d.toLocaleDateString('en-US', { weekday: 'long' }),
      };
    } catch {
      return { date: dateStr, day: '' };
    }
  };

  const handleExport = () => {
    setExportHint('Export is being prepared. This feature will be available soon.');
  };

  const handleNavigateToTest = (cbtSessionId: string) => {
    navigate(`/practice/summary/${cbtSessionId}`);
  };

  const confirmCancelTest = async () => {
    if (!testToCancel) return;
    try {
      setCancelError(null);
      await testHistoryApi.cancelTestSession(testToCancel);
      toast({ title: 'Test Cancelled', description: 'The test has been cancelled successfully.' });
      setCancelConfirmOpen(false);
      setTestToCancel(null);
      window.location.reload();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel test');
    }
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  const userInitials = fullName
    ? fullName.split(' ').filter(Boolean).slice(0, 2).map((n) => n.charAt(0).toUpperCase()).join('')
    : 'SN';
  const avatarUrl = user?.avatar?.trim();
  const hasAvatar = Boolean(avatarUrl);

  return (
    <Layout
      title="Test History"
      headerActions={
        <div className="flex items-center gap-2">
          <NewTestDialog onStart={handlePrepareTest} subjects={user?.courses || []}>
            <Button className="text-white" style={{ backgroundColor: orange }}>
              Start New Test
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </NewTestDialog>
          <div className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium text-muted-foreground">
            <Trophy className="h-4 w-4" style={{ color: orange }} />
            <span>{cards?.rank !== null && cards?.rank !== undefined ? `#${cards.rank}` : '--'}</span>
          </div>
        </div>
      }
    >
      <div className="relative overflow-hidden space-y-5">
        {/* Ambient orange glow — top-right anchor, matches brand */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 55% 35% at 100% 0%, hsl(25,95%,53%), transparent)",
            opacity: 0.12,
          }}
        />

        {/* Alert banners */}
        {prepareError && (
          <SectionAlertBanner
            title="Unable to prepare test"
            description={prepareError}
            onDismiss={clearPrepareError}
          />
        )}
        {cardsError && (
          <SectionAlertBanner
            title="Unable to load dashboard cards"
            description={cardsError}
          />
        )}
        {cancelError && (
          <SectionAlertBanner
            title="Unable to cancel test"
            description={cancelError}
            onDismiss={() => setCancelError(null)}
          />
        )}
        {exportHint && (
          <SectionAlertBanner
            title="Export info"
            description={exportHint}
            onDismiss={() => setExportHint(null)}
            className="border-border bg-muted/40 text-foreground"
          />
        )}

        {/* KPI Strip */}
        {!loading && (
          <div className="flex items-stretch gap-0 divide-x divide-border border rounded-xl overflow-hidden">
            {kpiStats.map((stat, i) => (
              <div key={i} className="flex-1 px-5 py-4 min-w-0">
                <div className="mb-2" style={{ color: orange }}>{stat.icon}</div>
                <p className="text-2xl font-black tabular-nums leading-none" style={{ color: orange }}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 truncate">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="rounded-xl border border-border bg-background px-4 py-3 flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject, date..."
                className="pl-8 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2 relative">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4" />
                  {filterStatus && (
                    <span
                      className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background"
                      style={{ backgroundColor: orange }}
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setFilterStatus(undefined)}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('submitted')}>Submitted</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('in-progress')}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('not-started')}>Not Started</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('cancelled')}>Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="score-desc">Score (Highest)</SelectItem>
                <SelectItem value="score-asc">Score (Lowest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={handleExport} className="flex gap-2 text-muted-foreground">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: orange }} />
              <p className="text-sm text-muted-foreground">Loading test history...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive text-sm">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subjects</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Performance</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => {
                    const { date, day } = formatDate(test.date);
                    const scorePercent = test.maxScore > 0 ? (test.score / test.maxScore) * 100 : 0;
                    return (
                      <TableRow key={test.id}>
                        <TableCell>
                          <p className="text-sm font-medium whitespace-nowrap">{date}</p>
                          <p className="text-xs text-muted-foreground">{day}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {test.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="outline" className="rounded-full text-xs px-2.5 py-0.5 font-medium">
                                {subject.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {test.status === 'submitted' ? (
                            <div className="min-w-[64px]">
                              <p className="text-sm font-semibold">
                                {Math.round(test.score)}
                                <span className="text-xs font-normal text-muted-foreground">/{test.maxScore}</span>
                              </p>
                              <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${scorePercent}%`, backgroundColor: orange }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">--</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{test.timeUsed || '--'}</p>
                          <p className="text-xs text-muted-foreground">{test.avgSpeed || '--'}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded-md">
                            {PracticeTestType[test.practiceTestType]}
                          </span>
                        </TableCell>
                        <TableCell>{renderStatusBadge(test.status)}</TableCell>
                        <TableCell>
                          {['not-started', 'in-progress'].includes(test.status) ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleNavigateToTest(test.id)}>
                                  {test.status === 'not-started' ? 'Start' : 'Continue'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => { setTestToCancel(test.id); setCancelConfirmOpen(true); }}
                                  className="text-destructive"
                                >
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : test.status === 'submitted' ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setSelectedTest(test); setIsTestDetailsOpen(true); }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <div
                        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                        style={{ backgroundColor: 'hsl(25 95% 53% / 0.1)' }}
                      >
                        <ClipboardList className="h-7 w-7" style={{ color: orange }} />
                      </div>
                      <p className="text-base font-semibold">No tests yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start a new test to see your history here.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {filteredTests.length > 0 && totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Preparing Dialog */}
      <Dialog
        open={preparing && preparingDialogOpen}
        onOpenChange={(open) => { if (!open) setPreparingDialogOpen(false); }}
      >
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'hsl(25 95% 53% / 0.1)' }}
            >
              <Loader2 className="h-7 w-7 animate-spin" style={{ color: orange }} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Preparing your test</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                We're fetching questions for your practice session. This usually takes a few seconds.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPreparingDialogOpen(false)}>
              Continue in background
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showPreparedDialog} onOpenChange={(open) => setShowPreparedDialog(open)}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Questions Ready!</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Your test has been prepared and is ready to start.
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button
                className="w-full font-semibold"
                style={{ backgroundColor: orange }}
                onClick={handleGoToTest}
              >
                Go to Test
              </Button>
              <Button className="w-full" variant="ghost" onClick={() => setShowPreparedDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Cancel Test</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Are you sure you want to cancel this test? This action cannot be undone and the test will be marked as cancelled.
              </DialogDescription>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setCancelConfirmOpen(false); setTestToCancel(null); }}
            >
              Keep Test
            </Button>
            <Button variant="destructive" onClick={confirmCancelTest} className="gap-2">
              <XCircle className="h-4 w-4" />
              Cancel Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Details Sheet */}
      <Sheet open={isTestDetailsOpen} onOpenChange={setIsTestDetailsOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="sr-only">Test Details</SheetTitle>
          </SheetHeader>
          {selectedTest && (
            <div className="mt-4 space-y-5">
              {/* Header card with dark navy strip + overlapping KPI card */}
              <div className="rounded-xl overflow-hidden border">
                <div className="bg-primary px-6 pt-6 pb-14">
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-1"
                        style={{ color: 'hsl(var(--primary-foreground) / 0.6)' }}
                      >
                        Test Results
                      </p>
                      <h2 className="text-xl font-black text-primary-foreground">
                        {fullName || 'Student Name'}
                      </h2>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1"
                      style={{
                        backgroundColor: 'hsl(25 95% 53% / 0.25)',
                        color: 'hsl(var(--brand-orange))',
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {selectedTest.status === 'submitted' ? 'Submitted' : selectedTest.status}
                    </span>
                  </div>
                </div>
                <div className="relative -mt-8 mx-4 rounded-xl border bg-card shadow-md px-4 pb-4 pt-10">
                  {/* Avatar at the seam */}
                  <div className="absolute -top-6 left-5">
                    <div className="w-12 h-12 rounded-full bg-background border-2 border-border overflow-hidden shadow-sm">
                      {hasAvatar ? (
                        <img src={avatarUrl} alt="Student Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground bg-muted">
                          {userInitials}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 3-cell KPI strip */}
                  <div className="flex items-stretch divide-x divide-border border rounded-xl overflow-hidden">
                    <div className="flex-1 px-3 py-3 text-center min-w-0">
                      <p className="text-xl font-black tabular-nums" style={{ color: orange }}>
                        {Math.round(selectedTest.score)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Total Score</p>
                    </div>
                    <div className="flex-1 px-3 py-3 text-center min-w-0">
                      <p className="text-xl font-black tabular-nums" style={{ color: orange }}>
                        {selectedTest.numberOfCorrectAnswers}/{selectedTest.numberOfQuestionAttempted}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Accuracy</p>
                    </div>
                    <div className="flex-1 px-3 py-3 text-center min-w-0">
                      <p className="text-sm font-black truncate" style={{ color: orange }}>
                        {selectedTest.timeUsed || '--'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Time Used</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-4 mt-3">
                  <p className="text-xs text-muted-foreground">{selectedTest.date}</p>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="border rounded-xl p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Performance Chart
                </h3>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedTest.subjects}
                      margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => value.substring(0, 4).toUpperCase()}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        formatter={(_value: number, _name: string, props) => {
                          const subject = props.payload as TestSubject;
                          return [`${Math.round(subject.score)}/${subject.maxScore}`, 'Score'];
                        }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar
                        dataKey="percentageScore"
                        fill="hsl(25, 95%, 53%)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subject Analysis */}
              <div className="border rounded-xl p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Subject Analysis
                </h3>
                {/* Summary KPI strip */}
                <div className="flex items-stretch divide-x divide-border border rounded-xl overflow-hidden mb-5">
                  {[
                    { label: 'Total Qs', value: selectedTest.numberOfQuestion, cls: '' },
                    { label: 'Attempted', value: selectedTest.numberOfQuestionAttempted, cls: '' },
                    { label: 'Correct', value: selectedTest.numberOfCorrectAnswers, cls: 'text-green-600' },
                    { label: 'Wrong', value: selectedTest.numberOfWrongAnswers, cls: 'text-destructive' },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 px-3 py-3 text-center min-w-0">
                      <p className={`text-lg font-black tabular-nums ${item.cls}`}>{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.label}</p>
                    </div>
                  ))}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTest.subjects.map((subject, index) => {
                      const pct = subject.maxScore > 0 ? (subject.score / subject.maxScore) * 100 : 0;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>
                            <div className="min-w-[80px]">
                              <p className="text-sm font-semibold">
                                {Math.round(subject.score)}
                                <span className="text-xs font-normal text-muted-foreground">/{subject.maxScore}</span>
                              </p>
                              <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: orange }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Review Test */}
              <Button
                className="w-full font-semibold"
                style={{ backgroundColor: orange }}
                onClick={() => {
                  navigate(`/practice/review/${selectedTest.id}`);
                  setIsTestDetailsOpen(false);
                }}
              >
                Review Test
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
