import React, { useState, useEffect } from 'react';
import Layout from '../../../components/common/Layout';
import { Eye, Download, Search, Filter, ChevronDown, MoreVertical } from 'lucide-react';
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
import { Skeleton } from '../../../components/ui/skeleton';
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
import { UserProfile, TestRecord } from '../types/testHistoryTypes';

export function TestHistoryTable() {
  // State for UI controls
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [isTestDetailsOpen, setIsTestDetailsOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // Data from hook
  const { items, totalPages, loading, error } = useTestHistory(currentPage, pageSize);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await testHistoryApi.fetchUserProfile();
        setUserProfile(profile);
      } catch (err) {
        // Handle error if needed
      }
    };
    fetchUserProfile();
  }, []);

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
    const baseClass = 'inline-block px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-medium';
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
  const handleGoToTest = async (cbtSessionId: string) => {
    try {
      const config = await testHistoryApi.fetchTestConfiguration(cbtSessionId);
      navigate('/practice/test', {
        state: {
          cbtSessionId: config.cbtSessionId,
          preparedQuestion: config.preparedQuestion,
          examConfig: config.examConfig,
          status: config.status,
        },
      });
    } catch (err: any) {
      alert(err.message || 'Failed to fetch test configuration');
    }
  };

  return (
    <Layout title="Test History">
      <div className="bg-background px-4 py-4 sm:px-6 sm:py-5 rounded-lg shadow-sm">
        <div className="flex flex-col gap-3 mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold">Test History</h2>
          <Button size="sm" className="w-full sm:w-auto text-[10px] sm:text-xs px-2 py-1">
            Start New Test
          </Button>
        </div>
        <div className="flex flex-col gap-2 mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search by subject, date..."
                className="pl-6 text-[10px] sm:text-xs h-7 sm:h-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-1 text-[10px] sm:text-xs h-7 sm:h-8 px-2">
                  <Filter className="h-3 w-3" />
                  Filter
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-[10px] sm:text-xs">
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
              <SelectTrigger className="w-full sm:w-32 text-[10px] sm:text-xs h-7 sm:h-8">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc" className="text-[10px] sm:text-xs">Date (Newest)</SelectItem>
                <SelectItem value="date-asc" className="text-[10px] sm:text-xs">Date (Oldest)</SelectItem>
                <SelectItem value="score-desc" className="text-[10px] sm:text-xs">Score (Highest)</SelectItem>
                <SelectItem value="score-asc" className="text-[10px] sm:text-xs">Score (Lowest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleExport} className="flex gap-1 text-[10px] sm:text-xs h-7 sm:h-8 px-2">
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>
        <div className="border rounded-md">
          {loading ? (
            <div className="p-4 sm:p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16 sm:w-20" />
                  <Skeleton className="h-3 w-24 sm:w-32" />
                  <Skeleton className="h-3 w-12 sm:w-16" />
                  <Skeleton className="h-3 w-16 sm:w-20" />
                  <Skeleton className="h-6 w-6" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 sm:p-5 text-center text-[10px] sm:text-xs text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] sm:text-xs">Date</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Subjects</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Score</TableHead>
                  <TableHead className="text-[10px] sm:text-xs">Status</TableHead>
                  <TableHead className="text-right text-[10px] sm:text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="text-[10px] sm:text-xs truncate">{test.date}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs">
                        <div className="flex flex-wrap gap-1">
                          {test.subjects.map((subject, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px]">
                              {subject.name.substring(0, 3)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] sm:text-xs">
                        {test.status === 'submitted' ? `${Math.round(test.score)}` : '--'}
                      </TableCell>
                      <TableCell className="text-[10px] sm:text-xs">{renderStatusBadge(test.status)}</TableCell>
                      <TableCell className="text-right">
                        {['not-started', 'in-progress'].includes(test.status) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-[10px] sm:text-xs w-32">
                              <DropdownMenuItem onClick={() => handleGoToTest(test.id)}>
                                {test.status === 'not-started' ? 'Start' : 'Continue'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  try {
                                    await testHistoryApi.cancelTestSession(test.id);
                                    window.location.reload();
                                  } catch (err: any) {
                                    alert(err.message || 'Failed to cancel test');
                                  }
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
                            className="h-6 w-6"
                            onClick={() => {
                              setSelectedTest(test);
                              setIsTestDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-[10px] sm:text-xs text-muted-foreground">
                      No test history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        {filteredTests.length > 0 && totalPages > 1 && (
          <div className="mt-3 sm:mt-4 flex justify-center">
            <Pagination>
              <PaginationContent className="flex flex-wrap gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    aria-disabled={currentPage === 1}
                    className={`text-[10px] sm:text-xs h-6 sm:h-7 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                  const page = i + 1 + Math.max(0, currentPage - 2);
                  if (page > totalPages) return null;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                        className="text-[10px] sm:text-xs h-6 w-6 sm:h-7 sm:w-7"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    aria-disabled={currentPage === totalPages}
                    className={`text-[10px] sm:text-xs h-6 sm:h-7 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        {/* Test Details Sheet */}
        <Sheet open={isTestDetailsOpen} onOpenChange={setIsTestDetailsOpen}>
          <SheetContent className="w-full max-w-[95%] sm:max-w-[400px] overflow-y-auto p-3 sm:p-4">
            <SheetHeader>
              <SheetTitle className="text-base sm:text-lg">Test Details</SheetTitle>
            </SheetHeader>
            {selectedTest && (
              <div className="mt-3 sm:mt-4">
                {/* Student Info Section */}
                <div className="bg-primary/10 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-primary">
                          {userProfile?.name || 'Student Name'}
                        </h2>
                        <div className="mt-1 text-[10px] sm:text-xs text-muted-foreground flex flex-wrap gap-2">
                          <span>Date: {selectedTest.date}</span>
                          <span>Time: {selectedTest.timeUsed || '--:--:--'}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-right text-[10px] sm:text-xs text-muted-foreground">Status</div>
                        <Badge className="bg-primary text-primary-foreground mt-1 text-[10px]">
                          {selectedTest.status === 'submitted' ? 'Submitted' : selectedTest.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-10 h-10 rounded-full bg-background border-2 border-background overflow-hidden">
                        <img
                          src={userProfile?.avatar || 'https://via.placeholder.com/40'}
                          alt="Student Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Performance Chart Section */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm sm:text-base font-semibold">Performance</h3>
                    <div className="text-base sm:text-lg font-bold">
                      Score <span className="text-primary">{Math.round(selectedTest.score)}</span>
                    </div>
                  </div>
                  <div className="h-[160px] sm:h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedTest.subjects}
                        margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 9 }}
                          tickFormatter={(value) => value.substring(0, 3).toUpperCase()}
                        />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                        <RechartsTooltip
                          formatter={(value: number) => [`${Math.round(value)}%`, 'Score']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '4px',
                            fontSize: '10px',
                          }}
                        />
                        <Bar
                          dataKey="score"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Test Subject Analysis */}
                <div className="bg-muted/50 p-3 sm:p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm sm:text-base font-semibold">Subject Analysis</h3>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      Time <span className="font-bold">{selectedTest.timeUsed}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                    <div className="bg-background rounded px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs border">
                      Total: <span className="font-bold">{selectedTest.numberOfQuestion}</span>
                    </div>
                    <div className="bg-background rounded px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs border">
                      Attempted: <span className="font-bold">{selectedTest.numberOfQuestionAttempted}</span>
                    </div>
                    <div className="bg-background rounded px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs border">
                      Correct: <span className="font-bold text-green-700">{selectedTest.numberOfCorrectAnswers}</span>
                    </div>
                    <div className="bg-background rounded px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs border">
                      Wrong: <span className="font-bold text-red-700">{selectedTest.numberOfWrongAnswers}</span>
                    </div>
                  </div>
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px] sm:text-xs">Subjects</TableHead>
                          <TableHead className="text-[10px] sm:text-xs">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTest.subjects.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-[10px] sm:text-xs truncate">{subject.name}</TableCell>
                            <TableCell className="text-[10px] sm:text-xs">{Math.round(subject.score)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <Button 
                    className="w-full text-[10px] sm:text-xs h-7 sm:h-8"
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
      </div>
    </Layout>
  );
}