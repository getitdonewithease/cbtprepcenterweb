import { useState } from 'react';
import { Plus, Search, Archive, Users, Filter, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/common/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { useOrgCourses } from '../hooks/useOrgCourses';
import { useUserContext } from '@/features/dashboard';
import { getErrorMessage } from '@/core/errors/utils';
import type { OrgCourse } from '../types/organizationTypes';

// ─── Create course form schema ─────────────────────────────────────────────────

const createCourseSchema = z.object({
  name: z.string().min(2, 'Course name must be at least 2 characters'),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  description: z.string().optional(),
});
type CreateCourseForm = z.infer<typeof createCourseSchema>;

// ─── Status badge ─────────────────────────────────────────────────────────────

function CourseBadge({ status }: { status: OrgCourse['status'] }) {
  const base = 'inline-block px-3 py-0.5 rounded-full border text-xs font-medium';
  if (status === 'active') {
    return <span className={`${base} border-green-300 bg-green-50 text-green-800`}>Active</span>;
  }
  return <span className={`${base} border-gray-300 bg-gray-50 text-gray-800`}>Archived</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CoursesPage = () => {
  const { user } = useUserContext();
  const isAdmin = user?.organizationRole === 'org_admin';

  const { courses, loading, error, addCourse, archiveCourse } = useOrgCourses(isAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrgCourse['status'] | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateCourseForm>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { name: '', subject: '', description: '' },
  });

  const filtered = courses.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
  });

  const handleCreate = async (values: CreateCourseForm) => {
    try {
      setSubmitting(true);
      await addCourse({ name: values.name, subject: values.subject, description: values.description });
      toast({ title: 'Course created', description: `"${values.name}" has been added.` });
      form.reset();
      setCreateOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed to create course'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (course: OrgCourse) => {
    try {
      await archiveCourse(course.id);
      toast({ title: 'Course archived', description: `"${course.name}" has been archived.` });
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed to archive course'), variant: 'destructive' });
    }
  };

  return (
    <Layout
      title="Courses"
      headerActions={
        isAdmin ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        ) : undefined
      }
    >
      <div className="bg-background p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Courses</h2>
          <Badge variant="secondary">{courses.length} {isAdmin ? 'total' : 'enrolled'}</Badge>
        </div>

        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or subject..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filter — admin only */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  {filterStatus ? (filterStatus === 'active' ? 'Active' : 'Archived') : 'All Status'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus(undefined)}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('archived')}>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-md">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Assessments</TableHead>
                  <TableHead>Resources</TableHead>
                  {/* Status column — admin only */}
                  {isAdmin && <TableHead>Status</TableHead>}
                  {/* Actions column — admin only */}
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {course.enrolledCount}
                        </div>
                      </TableCell>
                      <TableCell>{course.assessmentCount}</TableCell>
                      <TableCell>{course.resourceCount}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <CourseBadge status={course.status} />
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell className="text-right">
                          {course.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleArchive(course)}
                              aria-label="Archive course"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 7 : 5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Create Course Dialog — rendered only for admins */}
      {isAdmin && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>Create a new course for your organization.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics Advanced" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief course description..." className="resize-none" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Course'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default CoursesPage;
