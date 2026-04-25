import { useState } from 'react';
import { Plus, Search, Filter, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/common/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useOrgAssessments } from '../hooks/useOrgAssessments';
import { useUserContext } from '@/features/dashboard';
import { getErrorMessage } from '@/core/errors/utils';
import type { OrgAssessment, StudentAssessment } from '../types/organizationTypes';

// ─── Create assessment form schema ────────────────────────────────────────────

const createAssessmentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  courseId: z.string().min(1, 'Course ID is required'),
  durationMinutes: z.coerce.number().min(5, 'At least 5 minutes').max(300),
  dueDate: z.string().optional(),
});
type CreateAssessmentForm = z.infer<typeof createAssessmentSchema>;

// ─── Status badges ────────────────────────────────────────────────────────────

function AdminStatusBadge({ status }: { status: OrgAssessment['status'] }) {
  const base = 'inline-block px-3 py-0.5 rounded-full border text-xs font-medium';
  if (status === 'published') return <span className={`${base} border-green-300 bg-green-50 text-green-800`}>Published</span>;
  if (status === 'closed')    return <span className={`${base} border-red-300 bg-red-50 text-red-800`}>Closed</span>;
  return <span className={`${base} border-gray-300 bg-gray-50 text-gray-800`}>Draft</span>;
}

function StudentStatusBadge({ status }: { status: StudentAssessment['submissionStatus'] }) {
  const base = 'inline-block px-3 py-0.5 rounded-full border text-xs font-medium';
  if (status === 'submitted') return <span className={`${base} border-green-300 bg-green-50 text-green-800`}>Submitted</span>;
  return <span className={`${base} border-amber-300 bg-amber-50 text-amber-800`}>Pending</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AssessmentsPage = () => {
  const { user } = useUserContext();
  const isAdmin = user?.organizationRole === 'org_admin';

  const { assessments, loading, error, addAssessment, changeStatus } = useOrgAssessments(isAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateAssessmentForm>({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: { title: '', courseId: '', durationMinutes: 30, dueDate: '' },
  });

  const filtered = assessments.filter((a) => {
    if (filterStatus) {
      const statusField = isAdmin
        ? (a as OrgAssessment).status
        : (a as StudentAssessment).submissionStatus;
      if (statusField !== filterStatus) return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.courseName.toLowerCase().includes(q);
  });

  const handleCreate = async (values: CreateAssessmentForm) => {
    try {
      setSubmitting(true);
      await addAssessment({
        title: values.title,
        courseId: values.courseId,
        durationMinutes: values.durationMinutes,
        dueDate: values.dueDate || undefined,
      });
      toast({ title: 'Assessment created', description: `"${values.title}" has been added.` });
      form.reset();
      setCreateOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed to create assessment'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (assessment: OrgAssessment, status: OrgAssessment['status']) => {
    try {
      await changeStatus(assessment.id, status);
      const label = status === 'published' ? 'published' : status === 'closed' ? 'closed' : 'reverted to draft';
      toast({ title: 'Assessment updated', description: `"${assessment.title}" has been ${label}.` });
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed to update assessment'), variant: 'destructive' });
    }
  };

  // Filter options differ by role
  const filterOptions = isAdmin
    ? [
        { label: 'All Status', value: undefined },
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Closed', value: 'closed' },
      ]
    : [
        { label: 'All', value: undefined },
        { label: 'Pending', value: 'not-started' },
        { label: 'Submitted', value: 'submitted' },
      ];

  return (
    <Layout
      title="Assessments"
      headerActions={
        isAdmin ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        ) : undefined
      }
    >
      <div className="bg-background p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">
            {isAdmin ? 'Assessments' : 'My Assessments'}
          </h2>
          {/* Student-only pending/done summary badges */}
          {!isAdmin && (
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                {(assessments as StudentAssessment[]).filter((a) => a.submissionStatus === 'submitted').length} done
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3 text-amber-500" />
                {(assessments as StudentAssessment[]).filter((a) => a.submissionStatus === 'not-started').length} pending
              </Badge>
            </div>
          )}
          {/* Admin-only total count */}
          {isAdmin && <Badge variant="secondary">{assessments.length} total</Badge>}
        </div>

        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or course..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                {filterOptions.find((o) => o.value === filterStatus)?.label ?? 'Filter'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {filterOptions.map((opt) => (
                <DropdownMenuItem key={String(opt.value)} onClick={() => setFilterStatus(opt.value)}>
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="border rounded-md">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading assessments...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Due Date</TableHead>
                  {/* Admin columns */}
                  {isAdmin && <TableHead>Submissions</TableHead>}
                  {isAdmin && <TableHead>Avg. Score</TableHead>}
                  {isAdmin && <TableHead>Status</TableHead>}
                  {/* Student columns */}
                  {!isAdmin && <TableHead>My Score</TableHead>}
                  {!isAdmin && <TableHead>Status</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.title}</TableCell>
                      <TableCell><Badge variant="outline">{assessment.courseName}</Badge></TableCell>
                      <TableCell>{assessment.durationMinutes}m</TableCell>
                      <TableCell>
                        {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : '—'}
                      </TableCell>

                      {/* Admin-specific cells */}
                      {isAdmin && <TableCell>{(assessment as OrgAssessment).totalSubmissions}</TableCell>}
                      {isAdmin && (
                        <TableCell>
                          {(assessment as OrgAssessment).avgScore != null
                            ? `${Math.round((assessment as OrgAssessment).avgScore!)}%`
                            : '—'}
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          <AdminStatusBadge status={(assessment as OrgAssessment).status} />
                        </TableCell>
                      )}

                      {/* Student-specific cells */}
                      {!isAdmin && (
                        <TableCell>
                          {(assessment as StudentAssessment).submissionStatus === 'submitted' &&
                          (assessment as StudentAssessment).myScore != null
                            ? `${Math.round((assessment as StudentAssessment).myScore!)}%`
                            : '—'}
                        </TableCell>
                      )}
                      {!isAdmin && (
                        <TableCell>
                          <StudentStatusBadge status={(assessment as StudentAssessment).submissionStatus} />
                        </TableCell>
                      )}

                      {/* Actions */}
                      <TableCell className="text-right">
                        {isAdmin ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(assessment as OrgAssessment).status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(assessment as OrgAssessment, 'published')}>
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {(assessment as OrgAssessment).status === 'published' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(assessment as OrgAssessment, 'closed')}>
                                  Close
                                </DropdownMenuItem>
                              )}
                              {(assessment as OrgAssessment).status === 'published' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(assessment as OrgAssessment, 'draft')}>
                                  Revert to Draft
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          (assessment as StudentAssessment).submissionStatus === 'not-started' ? (
                            <Button size="sm">Start</Button>
                          ) : (
                            <Button size="sm" variant="outline">Review</Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 9 : 7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No assessments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Create Assessment Dialog — admin only */}
      {isAdmin && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Assessment</DialogTitle>
              <DialogDescription>Add a new assessment to your organization.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input placeholder="e.g. Mid-Term Mathematics Test" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course ID</FormLabel>
                      <FormControl><Input placeholder="Enter course ID" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl><Input type="number" min={5} max={300} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (optional)</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Assessment'}
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

export default AssessmentsPage;
