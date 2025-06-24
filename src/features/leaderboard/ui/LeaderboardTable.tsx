import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Search, Trophy, Medal, Award } from "lucide-react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import Layout from "../../../components/common/Layout";

const defaultEntries = [
  {
    id: "1",
    rank: 1,
    name: "Chioma Okonkwo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma",
    score: 298,
    accuracy: 94.5,
    speed: 45,
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
  },
  {
    id: "2",
    rank: 2,
    name: "Emeka Eze",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka",
    score: 285,
    accuracy: 92.1,
    speed: 52,
    subjects: ["Mathematics", "Physics", "Chemistry", "English"],
  },
  {
    id: "3",
    rank: 3,
    name: "Ngozi Adeyemi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ngozi",
    score: 279,
    accuracy: 90.8,
    speed: 48,
    subjects: ["Mathematics", "Economics", "Government", "English"],
    isCurrentUser: true,
  },
  {
    id: "4",
    rank: 4,
    name: "Oluwaseun Olatunji",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oluwaseun",
    score: 265,
    accuracy: 88.3,
    speed: 55,
    subjects: ["Mathematics", "Physics", "Chemistry", "English"],
  },
  {
    id: "5",
    rank: 5,
    name: "Amina Ibrahim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amina",
    score: 260,
    accuracy: 86.7,
    speed: 50,
    subjects: ["Mathematics", "Biology", "Chemistry", "English"],
  },
  {
    id: "6",
    rank: 6,
    name: "Tunde Bakare",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde",
    score: 255,
    accuracy: 85.0,
    speed: 58,
    subjects: ["Mathematics", "Economics", "Government", "English"],
  },
  {
    id: "7",
    rank: 7,
    name: "Fatima Mohammed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
    score: 248,
    accuracy: 82.7,
    speed: 60,
    subjects: ["Mathematics", "Physics", "Chemistry", "English"],
  },
  {
    id: "8",
    rank: 8,
    name: "Chinedu Obi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chinedu",
    score: 242,
    accuracy: 80.7,
    speed: 62,
    subjects: ["Mathematics", "Biology", "Chemistry", "English"],
  },
  {
    id: "9",
    rank: 9,
    name: "Blessing Nwachukwu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Blessing",
    score: 238,
    accuracy: 79.3,
    speed: 65,
    subjects: ["Mathematics", "Economics", "Government", "English"],
  },
  {
    id: "10",
    rank: 10,
    name: "Yusuf Abdullahi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yusuf",
    score: 230,
    accuracy: 76.7,
    speed: 68,
    subjects: ["Mathematics", "Physics", "Chemistry", "English"],
  },
];

export function LeaderboardTable() {
  const { entries, loading, error } = useLeaderboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all-time");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  // Use fallback if no data
  const dataEntries = entries.length > 0 ? entries : defaultEntries;

  // Apply filters
  const filteredEntries = dataEntries.filter((entry) => {
    const nameMatch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch =
      subjectFilter === "all" ||
      entry.subjects.some(
        (subject) => subject.toLowerCase() === subjectFilter.toLowerCase(),
      );
    return nameMatch && subjectMatch;
  });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);

  // Find current user's position
  const currentUserEntry = dataEntries.find((entry) => entry.isCurrentUser);
  const currentUserRank = currentUserEntry?.rank || 0;

  // Get medal icon based on rank
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Layout title="Leaderboard">
      <div className="w-full bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            National Leaderboard
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-3">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="economics">Economics</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {currentUserEntry && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {currentUserRank}
                </div>
                <Avatar className="h-10 w-10 border-2 border-blue-300">
                  <AvatarImage
                    src={currentUserEntry.avatar}
                    alt={currentUserEntry.name}
                  />
                  <AvatarFallback>
                    {currentUserEntry.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-blue-900">
                    {currentUserEntry.name} {" "}
                    <span className="text-blue-600 text-sm">(You)</span>
                  </p>
                  <div className="flex gap-2 text-xs text-blue-700">
                    {currentUserEntry.subjects.map((subject, index) => (
                      <span key={index}>
                        {subject}
                        {index < currentUserEntry.subjects.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-700">Score</p>
                  <p className="font-bold text-blue-900">
                    {currentUserEntry.score}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-700">Accuracy</p>
                  <p className="font-bold text-blue-900">
                    {currentUserEntry.accuracy}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-700">Avg. Speed</p>
                  <p className="font-bold text-blue-900">
                    {currentUserEntry.speed}s
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              Showing {indexOfFirstEntry + 1}-
              {Math.min(indexOfLastEntry, filteredEntries.length)} of {" "}
              {filteredEntries.length} candidates
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">Avg. Speed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={entry.isCurrentUser ? "bg-blue-50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getMedalIcon(entry.rank)}
                      <span>{entry.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={entry.avatar} alt={entry.name} />
                        <AvatarFallback>
                          {entry.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {entry.name}
                          {entry.isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              You
                            </Badge>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                          {entry.subjects.map((subject, index) => (
                            <span key={index}>
                              {subject}
                              {index < entry.subjects.length - 1 ? "," : ""} {" "}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {entry.score}
                  </TableCell>
                  <TableCell className="text-right">{entry.accuracy}%</TableCell>
                  <TableCell className="text-right">{entry.speed}s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Layout>
  );
}

export default LeaderboardTable; 