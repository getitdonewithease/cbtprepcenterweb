import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../../components/common/Layout';
import { Eye, Download, Search, Filter, ChevronDown, MoreVertical, ChevronRight, XCircle } from 'lucide-react';
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
  DialogHeader,
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
import { Badge } from '../../../components/ui/badge';
import { toast } from '../../../components/ui/use-toast';
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
import { TestRecord } from '../types/testHistoryTypes';
import { PracticeTestType } from '../../dashboard/types/dashboardTypes';
import NewTestDialog from '../../dashboard/ui/NewTestDialog';
import { usePrepareTest, useUserContext } from '@/features/dashboard';

export function TestHistoryTable() {
  // State for UI controls
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
  
  // Data from hooks
  const { items, totalPages, loading, error } = useTestHistory(currentPage, pageSize);
  const { user } = useUserContext();
  const {
    preparing,
    showPreparedDialog,
    handlePrepareTest,
    handleGoToTest,
    setShowPreparedDialog,
  } = usePrepareTest();
  
  const navigate = useNavigate();

  const wasPreparing = useRef(false);
  useEffect(() => {
    if (wasPreparing.current && !preparing && !showPreparedDialog && !preparingDialogOpen) {
      toast({
        title: "Questions Ready!",
        description: "Your practice test is ready to start.",
      });
    }
    wasPreparing.current = preparing;
  }, [preparing, showPreparedDialog, preparingDialogOpen]);

  // Filter and search logic
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

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    const baseClass = 'inline-block px-3 py-0.5 rounded-full border text-xs font-medium';
    switch (status) {
      case 'submitted':
        return <span className={baseClass + ' border-green-300 bg-green-50 text-green-800'}>Submitted</span>;
      case 'in-progress':
        return <span className={baseClass + ' border-yellow-300 bg-yellow-50 text-yellow-800'}>In Progress</span>;
      case 'not-started':
        return <span className={baseClass + ' border-gray-300 bg-gray-50 text-gray-800'}>Not Started</span>;
      case 'cancelled':
        return <span className={baseClass + ' border-red-300 bg-red-50 text-red-800'}>Cancelled</span>;
      default:
        return <span className={baseClass + ' border-gray-300 bg-gray-50 text-gray-800'}>{status}</span>;
    }
  };

  // Export functionality (mock)
  const handleExport = () => {
    alert('Exporting test history data...');
  };

  // Handler for starting or continuing a test
  const handleNavigateToTest = (cbtSessionId: string) => {
    navigate(`/practice/summary/${cbtSessionId}`);
  };

  const confirmCancelTest = async () => {
    if (!testToCancel) return;
    
    try {
      await testHistoryApi.cancelTestSession(testToCancel);
      toast({
        title: "Test Cancelled",
        description: "The test has been cancelled successfully.",
      });
      setCancelConfirmOpen(false);
      setTestToCancel(null);
      window.location.reload();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to cancel test',
        variant: "destructive",
      });
    }
  };

  const showPreparingDialog = preparing && preparingDialogOpen;

  return (
    <Layout title="Test History">
      <div className="bg-background p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Test History</h2>
          <NewTestDialog onStart={handlePrepareTest} subjects={user?.courses || []}>
            <Button>
              Start New Test
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </NewTestDialog>
        </div>

        {/* Preparing Dialog */}
        {showPreparingDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-8 rounded shadow text-center">
              <div className="text-lg font-semibold mb-2">Preparing Questions...</div>
              <div className="text-muted-foreground mb-4">Please wait while we prepare your test.</div>
              <Button variant="outline" onClick={() => setPreparingDialogOpen(false)}>
                Continue in background
              </Button>
            </div>
          </div>
        )}

        {/* Success Dialog */}
        {showPreparedDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-8 rounded shadow text-center">
              <div className="text-lg font-semibold mb-2 text-green-600">Successfully Prepared Questions</div>
              <div className="flex flex-col gap-2 mt-4">
                <Button className="w-full" onClick={handleGoToTest}>
                  Go To Test
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setShowPreparedDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject, date..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setFilterStatus(undefined)}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('submitted')}>
                  Submitted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('in-progress')}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('not-started')}>
                  Not Started
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('cancelled')}>
                  Cancelled
                </DropdownMenuItem>
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
          <Button variant="outline" onClick={handleExport} className="flex gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="border rounded-md">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading test history...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject Combination</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time Used</TableHead>
                  <TableHead>Avg. Speed</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {test.subjects.map((subject, idx) => (
                            <Badge key={idx} variant="outline">
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {test.status === 'submitted' ? `${Math.round(test.score)}` : '--'}
                      </TableCell>
                      <TableCell>{test.timeUsed}</TableCell>
                      <TableCell>{test.avgSpeed}</TableCell>
                      <TableCell>{PracticeTestType[test.practiceTestType]}</TableCell>
                      <TableCell>{renderStatusBadge(test.status)}</TableCell>
                      <TableCell className="text-right">
                        {['not-started', 'in-progress'].includes(test.status) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="ml-2">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleNavigateToTest(test.id)}
                              >
                                {test.status === 'not-started' ? 'Start' : 'Continue'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setTestToCancel(test.id);
                                  setCancelConfirmOpen(true);
                                }}
                                className="text-destructive"
                              >
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : test.status === 'submitted' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTest(test);
                              setIsTestDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      No test history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        {filteredTests.length > 0 && totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        {/* Test Details Sheet */}
        <Sheet open={isTestDetailsOpen} onOpenChange={setIsTestDetailsOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Test Details</SheetTitle>
            </SheetHeader>
            {selectedTest && (
              <div className="mt-6">
                {/* Student Info Section */}
                <div className="bg-primary/10 p-6 rounded-md relative mb-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">
                        {user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Student Name'}
                      </h2>
                      <div className="mt-2 text-muted-foreground">
                        <span>Test Date: {selectedTest.date}</span>
                        <span className="ml-6">
                          Test Time: {selectedTest.timeUsed || '--:--:--'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-right text-muted-foreground">Status</div>
                      <Badge className="bg-primary text-primary-foreground mt-1">
                        {selectedTest.status === 'submitted' ? 'Submitted' : selectedTest.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-16 h-16 rounded-full bg-background border-4 border-background overflow-hidden">
                      <img
                        src={user?.avatar || '/default-avatar.png'}
                        alt="Student Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                {/* Performance Chart Section */}
                <div className="mt-12 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Performance Chart</h3>
                    <div className="text-2xl font-bold">
                      Total Score{' '}
                      <span className="text-primary">{Math.round(selectedTest.score)}</span>
                    </div>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedTest.subjects}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => value.substring(0, 4).toUpperCase()}
                        />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <RechartsTooltip
                          formatter={(value: number, name: string, props: any) => [
                            `${Math.round(value)}/${props.payload.maxScore}`,
                            'Score'
                          ]}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                        <Bar
                          dataKey="score"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Test Subject Analysis */}
                <div className="bg-muted/50 p-6 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Test Subject Analysis</h3>
                    <div className="text-muted-foreground">
                      Total Time Used{' '}
                      <span className="font-bold text-foreground">{selectedTest.timeUsed}</span>
                    </div>
                  </div>
                  {/* Summary Row for Question Stats */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="bg-background rounded px-3 py-1 text-sm font-medium border">
                      Total Questions: <span className="font-bold">{selectedTest.numberOfQuestion}</span>
                    </div>
                    <div className="bg-background rounded px-3 py-1 text-sm font-medium border">
                      Attempted: <span className="font-bold">{selectedTest.numberOfQuestionAttempted}</span>
                    </div>
                    <div className="bg-background rounded px-3 py-1 text-sm font-medium border">
                      Correct: <span className="font-bold text-green-700">{selectedTest.numberOfCorrectAnswers}</span>
                    </div>
                    <div className="bg-background rounded px-3 py-1 text-sm font-medium border">
                      Wrong: <span className="font-bold text-red-700">{selectedTest.numberOfWrongAnswers}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subjects</TableHead>
                          <TableHead>Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTest.subjects.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{Math.round(subject.score)}/{subject.maxScore}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {/* Review Test Button */}
                <div className="mt-8">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => {
                      navigate(`/practice/review/${selectedTest.id}`);
                      setIsTestDetailsOpen(false);
                    }}
                  >
                    Review Test
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Cancel Test Confirmation Dialog */}
        <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Cancel Test
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this test? This action cannot be undone and the test will be marked as cancelled.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setCancelConfirmOpen(false);
                  setTestToCancel(null);
                }}
              >
                Keep Test
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmCancelTest}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Cancel Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
} 