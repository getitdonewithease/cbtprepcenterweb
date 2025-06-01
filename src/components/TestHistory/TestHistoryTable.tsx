import React, { useState, useEffect } from "react";
import { Eye, Download, Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/apiConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface TestRecord {
  id: string;
  date: string;
  subjects: Array<{
    name: string;
    score: number;
  }>;
  score: number;
  timeUsed: string;
  avgSpeed: string;
  status: "not-started" | "in-progress" | "submitted" | "cancelled";
  numberOfQuestion: number;
  numberOfQuestionAttempted: number;
  numberOfCorrectAnswers: number;
  numberOfWrongAnswers: number;
}

const TestHistoryTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [isTestDetailsOpen, setIsTestDetailsOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null);
  const [testHistory, setTestHistory] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);

  // Helper to format ISO date to yyyy-mm-dd
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  };

  // Helper to format duration (hh:mm:ss) to readable string
  const formatDuration = (duration: string) => {
    if (!duration) return "--";
    const [h, m, s] = duration.split(":");
    let str = "";
    if (h && h !== "00") str += `${parseInt(h)}h `;
    if (m && m !== "00") str += `${parseInt(m)}m `;
    if (s && s !== "00") {
      const seconds = Math.floor(parseFloat(s));
      str += seconds.toString() + "s";
    }
    return str.trim() || "--";
  };

  // Helper to format average speed
  const formatAverageSpeed = (speed: string) => {
    if (!speed || speed === "00:00:00") return "--";
    const [h, m, s] = speed.split(":");
    let str = "";
    if (h && h !== "00") str += `${parseInt(h)}h `;
    if (m && m !== "00") str += `${parseInt(m)}m `;
    if (s && s !== "00") {
      const seconds = Math.floor(parseFloat(s));
      str += seconds.toString() + "s";
    }
    return str.trim() || "--";
  };

  // Helper to map CbtSessionStatus to display status
  const mapSessionStatus = (status: number): TestRecord['status'] => {
    switch (status) {
      case 1: return "not-started";
      case 2: return "in-progress";
      case 3: return "submitted";
      case 4: return "cancelled";
      default: return "not-started";
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchTestHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const studentId = localStorage.getItem('studentId');
        if (!token || !studentId) {
          throw new Error('No authentication token or student ID found');
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const res = await api.get(`/api/v1/cbtsessions/`);
        console.log('API Response:', res.data);
        
        if (!isMounted) return;
        
        if (!res.data.isSuccess) {
          console.error('API Error:', res.data);
          throw new Error(res.data.message || 'Failed to fetch test history');
        }

        // Map backend data to TestRecord[]
        const items = res.data.value && Array.isArray(res.data.value.items) ? res.data.value.items : [];
        const mapped: TestRecord[] = items.map((item: any) => {
          return {
            id: item.id,
            date: formatDate(item.createdOn),
            subjects: item.subjectScore.map((subject: any) => ({
              name: subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1),
              score: subject.score
            })),
            score: item.score || 0,
            timeUsed: formatDuration(item.durationUsed),
            avgSpeed: formatAverageSpeed(item.averageSpeed),
            status: mapSessionStatus(item.cbtSessionStatus),
            numberOfQuestion: item.numberOfQuestion,
            numberOfQuestionAttempted: item.numberOfQuestionAttempted,
            numberOfCorrectAnswers: item.numberOfCorrectAnswers,
            numberOfWrongAnswers: item.numberOfWrongAnswers
          };
        });
        console.log('Mapped data:', mapped);
        setTestHistory(mapped);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.response?.data?.message || err.message || "Error fetching data");
        if (err.message === 'No authentication token found') {
          window.location.href = '/signin';
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTestHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await api.get("/api/v1/students/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.isSuccess && res.data.value) {
          setUserProfile({
            name: res.data.value.firstName && res.data.value.lastName ? `${res.data.value.firstName} ${res.data.value.lastName}` : res.data.value.firstName || res.data.value.lastName || res.data.value.name,
            email: res.data.value.email,
            avatar: res.data.value.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(res.data.value.firstName || res.data.value.name || 'Student')}`,
          });
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchUserProfile();
  }, []);

  // Filter and search logic
  const filteredTests = testHistory
    .filter((test) => {
      // Filter by status if selected
      if (filterStatus && test.status !== filterStatus) return false;

      // Search functionality
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          test.subjects.some((subject) =>
            subject.name.toLowerCase().includes(query),
          ) ||
          test.date.includes(query) ||
          test.status.includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sorting logic
      if (sortBy === "date-desc")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "score-desc") return b.score - a.score;
      if (sortBy === "score-asc") return a.score - b.score;
      // Default sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    const baseClass = "inline-block px-3 py-0.5 rounded-full border text-xs font-medium";
    switch (status) {
      case "submitted":
        return (
          <span className={baseClass + " border-green-300 bg-green-50 text-green-800"}>
            Submitted
          </span>
        );
      case "in-progress":
        return (
          <span className={baseClass + " border-yellow-300 bg-yellow-50 text-yellow-800"}>
            In Progress
          </span>
        );
      case "not-started":
        return (
          <span className={baseClass + " border-gray-300 bg-gray-50 text-gray-800"}>
            Not Started
          </span>
        );
      case "cancelled":
        return (
          <span className={baseClass + " border-red-300 bg-red-50 text-red-800"}>
            Cancelled
          </span>
        );
      default:
        return (
          <span className={baseClass + " border-gray-300 bg-gray-50 text-gray-800"}>
            {status}
          </span>
        );
    }
  };

  // Export functionality (mock)
  const handleExport = () => {
    alert("Exporting test history data...");
    // In a real app, this would generate and download a CSV/Excel file
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Test History</h2>
        <Button>Start New Practice Test</Button>
      </div>

      {/* Filters and search */}
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
              <DropdownMenuItem onClick={() => setFilterStatus("submitted")}>
                Submitted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("in-progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("not-started")}>
                Not Started
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
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

      {/* Test history table */}
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTests.length > 0 ? (
                paginatedTests.map((test) => (
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
                      {test.status === "submitted" ? `${Math.round(test.score)}` : "--"}
                    </TableCell>
                    <TableCell>{test.timeUsed}</TableCell>
                    <TableCell>{test.avgSpeed}</TableCell>
                    <TableCell>{renderStatusBadge(test.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={test.status !== "submitted"}
                        onClick={() => {
                          setSelectedTest(test);
                          setIsTestDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No test history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {filteredTests.length > itemsPerPage && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
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
                      {userProfile?.name || "Student Name"}
                    </h2>
                    <div className="mt-2 text-muted-foreground">
                      <span>Test Date: {selectedTest.date}</span>
                      <span className="ml-6">
                        Test Time: {selectedTest.timeUsed || "--:--:--"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-right text-muted-foreground">Status</div>
                    <Badge className="bg-primary text-primary-foreground mt-1">
                      {selectedTest.status === "submitted" ? "Submitted" : selectedTest.status}
                    </Badge>
                  </div>
                </div>
                <div className="absolute -bottom-10 left-6">
                  <div className="w-16 h-16 rounded-full bg-background border-4 border-background overflow-hidden">
                    <img
                      src={userProfile?.avatar}
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
                    Total Score{" "}
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
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 12 }}
                      />
                      <RechartsTooltip
                        formatter={(value: number) => [`${Math.round(value)}%`, "Score"]}
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
                  <h3 className="text-lg font-semibold">
                    Test Subject Analysis
                  </h3>
                  <div className="text-muted-foreground">
                    Total Time Used{" "}
                    <span className="font-bold text-foreground">{selectedTest.timeUsed}</span>
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
                      {selectedTest.subjects.map(
                        (subject, index) => (
                          <TableRow key={index}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>
                                  {Math.round(subject.score)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Review Test Button */}
              <div className="mt-8">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Review Test
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TestHistoryTable;
