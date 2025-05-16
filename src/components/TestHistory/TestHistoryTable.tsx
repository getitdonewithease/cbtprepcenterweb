import React, { useState } from "react";
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

interface TestRecord {
  id: number;
  date: string;
  subjects: string[];
  score: number;
  timeUsed: string;
  avgSpeed: string;
  status: "completed" | "in-progress" | "canceled";
}

const TestHistoryTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [isTestDetailsOpen, setIsTestDetailsOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null);

  // Mock test history data
  const testHistory: TestRecord[] = [
    {
      id: 1,
      date: "2023-05-15",
      subjects: ["Mathematics", "English", "Physics", "Chemistry"],
      score: 75,
      timeUsed: "2h 15m",
      avgSpeed: "1m 42s",
      status: "completed",
    },
    {
      id: 2,
      date: "2023-05-10",
      subjects: ["Mathematics", "English"],
      score: 82,
      timeUsed: "1h 30m",
      avgSpeed: "1m 15s",
      status: "completed",
    },
    {
      id: 3,
      date: "2023-05-05",
      subjects: ["Physics", "Chemistry"],
      score: 65,
      timeUsed: "1h 45m",
      avgSpeed: "1m 35s",
      status: "completed",
    },
    {
      id: 4,
      date: "2023-04-28",
      subjects: ["Mathematics"],
      score: 90,
      timeUsed: "45m",
      avgSpeed: "1m 10s",
      status: "completed",
    },
    {
      id: 5,
      date: "2023-04-20",
      subjects: ["English", "Literature"],
      score: 78,
      timeUsed: "1h 20m",
      avgSpeed: "1m 25s",
      status: "completed",
    },
    {
      id: 6,
      date: "2023-04-15",
      subjects: ["Biology", "Chemistry"],
      score: 0,
      timeUsed: "25m",
      avgSpeed: "2m 05s",
      status: "canceled",
    },
    {
      id: 7,
      date: "2023-04-10",
      subjects: ["Mathematics", "Physics"],
      score: 0,
      timeUsed: "1h 05m",
      avgSpeed: "--",
      status: "in-progress",
    },
  ];

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
            subject.toLowerCase().includes(query),
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
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("in-progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("canceled")}>
                Canceled
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
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {test.status === "completed" ? `${test.score}%` : "--"}
                  </TableCell>
                  <TableCell>{test.timeUsed}</TableCell>
                  <TableCell>{test.avgSpeed}</TableCell>
                  <TableCell>{renderStatusBadge(test.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={test.status !== "completed"}
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
                  disabled={currentPage === 1}
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
                  disabled={currentPage === totalPages}
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
            <SheetTitle>View Test</SheetTitle>
          </SheetHeader>

          {selectedTest && (
            <div className="mt-6">
              {/* Student Info Section */}
              <div className="bg-cyan-900 text-white p-6 rounded-md relative mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-300">
                      {selectedTest.studentName || "Student Name"}
                    </h2>
                    <div className="mt-2">
                      <span>Test Date: {selectedTest.date}</span>
                      <span className="ml-6">
                        Test Time: {selectedTest.testTime || "--:--:--"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-right">Status</div>
                    <Badge className="bg-green-500 mt-1">Submitted</Badge>
                  </div>
                </div>
                <div className="absolute -bottom-10 left-6">
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-white overflow-hidden">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Julius"
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
                    <span className="text-cyan-600">{selectedTest.score}%</span>
                  </div>
                </div>

                <div className="h-64 border border-gray-200 rounded-md p-4">
                  {/* Simple Bar Chart */}
                  <div className="flex h-full items-end justify-around gap-4">
                    {selectedTest.subjectPerformance?.map((subject, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center w-1/5"
                      >
                        <div
                          className="w-full bg-cyan-500 rounded-t-md"
                          style={{ height: `${subject.score}%` }}
                        ></div>
                        <div className="mt-2 text-xs text-center">
                          {subject.subject.substring(0, 4).toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Subject Analysis */}
              <div className="bg-blue-50 p-6 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Test Subject Analysis
                  </h3>
                  <div>
                    Total Time Used{" "}
                    <span className="font-bold">{selectedTest.timeUsed}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date Taken</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Analytics ( Passed / Total )</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTest.subjectPerformance?.map(
                        (subject, index) => (
                          <TableRow key={index}>
                            <TableCell>{subject.dateTaken}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-white">
                                {subject.subject}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={(subject.passed / subject.total) * 100}
                                  className="h-2 w-32"
                                />
                                <span>
                                  {subject.passed} / {subject.total}
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
                <Button className="w-full bg-cyan-800 hover:bg-cyan-900">
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
