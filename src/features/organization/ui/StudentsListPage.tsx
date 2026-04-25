import { useState } from 'react';
import { Search, Filter, ChevronDown, Eye, UserCheck, UserX } from 'lucide-react';
import Layout from '@/components/common/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrgStudents } from '../hooks/useOrgStudents';
import { useUserContext } from '@/features/dashboard';
import type { OrgStudent } from '../types/organizationTypes';

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrgStudent['status'] }) {
  const baseClass = 'inline-block px-3 py-0.5 rounded-full border text-xs font-medium';
  if (status === 'active') {
    return (
      <span className={baseClass + ' border-green-300 bg-green-50 text-green-800'}>Active</span>
    );
  }
  return (
    <span className={baseClass + ' border-gray-300 bg-gray-50 text-gray-800'}>Inactive</span>
  );
}

// ─── Student Details Sheet ────────────────────────────────────────────────────

function StudentDetailsSheet({
  student,
  open,
  onClose,
}: {
  student: OrgStudent | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!student) return null;

  const initials =
    `${student.firstName[0] ?? ''}${student.lastName[0] ?? ''}`.toUpperCase() || 'ST';
  const hasAvatar = Boolean(student.avatar?.trim());

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Student Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {/* Profile header */}
          <div className="bg-primary/10 p-6 rounded-md relative mb-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="mt-1 text-muted-foreground">{student.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {new Date(student.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={student.status} />
            </div>
            <div className="absolute -bottom-8 left-6">
              <Avatar className="h-16 w-16 border-4 border-background">
                {hasAvatar ? (
                  <AvatarImage src={student.avatar} alt={student.firstName} />
                ) : null}
                <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Performance stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{student.totalTestsTaken}</p>
                <p className="text-xs text-muted-foreground">Tests Taken</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">
                  {student.avgScore > 0 ? `${Math.round(student.avgScore)}%` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Avg. Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {student.enrolledCourses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.enrolledCourses.map((course, i) => (
                    <Badge key={i} variant="secondary">
                      {course}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not enrolled in any courses.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const StudentsListPage = () => {
  const { user } = useUserContext();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { items, totalPages, loading, error } = useOrgStudents(currentPage, pageSize);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrgStudent['status'] | undefined>();
  const [selectedStudent, setSelectedStudent] = useState<OrgStudent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Admin-only guard
  if (user && user.organizationRole !== 'org_admin') {
    return (
      <Layout title="Students">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">You don't have access to this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredStudents = items
    .filter((s) => {
      if (filterStatus && s.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const handleViewDetails = (student: OrgStudent) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  return (
    <Layout title="Students">
      <div className="bg-background p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Students</h2>
          <Badge variant="secondary" className="text-sm">
            {items.length} total
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                {filterStatus ? (filterStatus === 'active' ? 'Active' : 'Inactive') : 'All Status'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => setFilterStatus(undefined)}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                <UserX className="mr-2 h-4 w-4 text-gray-500" />
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="border rounded-md">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading students...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Enrolled Courses</TableHead>
                  <TableHead>Tests Taken</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const initials =
                      `${student.firstName[0] ?? ''}${student.lastName[0] ?? ''}`.toUpperCase() ||
                      'ST';
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.avatar} alt={student.firstName} />
                              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{student.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.enrolledCourses.slice(0, 2).map((c, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                            {student.enrolledCourses.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{student.enrolledCourses.length - 2}
                              </Badge>
                            )}
                            {student.enrolledCourses.length === 0 && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{student.totalTestsTaken}</TableCell>
                        <TableCell>
                          {student.avgScore > 0 ? `${Math.round(student.avgScore)}%` : '—'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={student.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(student)}
                            aria-label="View student details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <StudentDetailsSheet
        student={selectedStudent}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </Layout>
  );
};

export default StudentsListPage;
