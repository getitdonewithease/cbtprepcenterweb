import { useState } from 'react';
import { Plus, Search, Trash2, ExternalLink, FileText, Video, Link as LinkIcon, File, Filter, ChevronDown } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useOrgResources } from '../hooks/useOrgResources';
import { useUserContext } from '@/features/dashboard';
import { getErrorMessage } from '@/core/errors/utils';
import type { OrgResource } from '../types/organizationTypes';

// ─── Add resource form schema ─────────────────────────────────────────────────

const createResourceSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['pdf', 'video', 'link', 'document']),
  url: z.string().url('Please enter a valid URL'),
  courseId: z.string().optional(),
});
type CreateResourceForm = z.infer<typeof createResourceSchema>;

// ─── Type icon & badge ────────────────────────────────────────────────────────

function ResourceTypeIcon({ type }: { type: OrgResource['type'] }) {
  switch (type) {
    case 'pdf':    return <FileText className="h-4 w-4 text-red-500" />;
    case 'video':  return <Video className="h-4 w-4 text-blue-500" />;
    case 'link':   return <LinkIcon className="h-4 w-4 text-green-500" />;
    default:       return <File className="h-4 w-4 text-gray-500" />;
  }
}

function ResourceTypeBadge({ type }: { type: OrgResource['type'] }) {
  const styles: Record<OrgResource['type'], string> = {
    pdf:      'border-red-300 bg-red-50 text-red-800',
    video:    'border-blue-300 bg-blue-50 text-blue-800',
    link:     'border-green-300 bg-green-50 text-green-800',
    document: 'border-gray-300 bg-gray-50 text-gray-800',
  };
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full border text-xs font-medium capitalize ${styles[type]}`}>
      {type}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ResourcesPage = () => {
  const { user } = useUserContext();
  const isAdmin = user?.organizationRole === 'org_admin';

  const { resources, loading, error, addResource, removeResource } = useOrgResources(isAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<OrgResource['type'] | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OrgResource | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<CreateResourceForm>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: { title: '', description: '', type: 'link', url: '', courseId: '' },
  });

  const filtered = resources.filter((r) => {
    if (filterType && r.type !== filterType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.courseName?.toLowerCase().includes(q);
  });

  const handleCreate = async (values: CreateResourceForm) => {
    try {
      setSubmitting(true);
      await addResource({
        title: values.title,
        description: values.description,
        type: values.type,
        url: values.url,
        courseId: values.courseId || undefined,
      });
      toast({ title: 'Resource added', description: `"${values.title}" has been added.` });
      form.reset();
      setCreateOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed to add resource'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await removeResource(deleteTarget.id);
      toast({ title: 'Resource deleted', description: `"${deleteTarget.title}" has been removed.` });
      setDeleteTarget(null);
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err, 'Failed to delete resource'), variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const typeFilterOptions: Array<{ label: string; value: OrgResource['type'] | undefined }> = [
    { label: 'All Types', value: undefined },
    { label: 'PDF', value: 'pdf' },
    { label: 'Video', value: 'video' },
    { label: 'Link', value: 'link' },
    { label: 'Document', value: 'document' },
  ];

  return (
    <Layout
      title="Resources"
      headerActions={
        isAdmin ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        ) : undefined
      }
    >
      <div className="bg-background p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Resources</h2>
          <Badge variant="secondary">{resources.length} {isAdmin ? 'total' : 'available'}</Badge>
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
                {typeFilterOptions.find((o) => o.value === filterType)?.label ?? 'All Types'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {typeFilterOptions.map((opt) => (
                <DropdownMenuItem key={String(opt.value)} onClick={() => setFilterType(opt.value)}>
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="border rounded-md">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading resources...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Course</TableHead>
                  {/* Uploaded by — admin only */}
                  {isAdmin && <TableHead>Uploaded By</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ResourceTypeIcon type={resource.type} />
                          <span className="font-medium">{resource.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ResourceTypeBadge type={resource.type} />
                      </TableCell>
                      <TableCell>
                        {resource.courseName ? (
                          <Badge variant="outline">{resource.courseName}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-muted-foreground">{resource.uploadedBy}</TableCell>
                      )}
                      <TableCell className="text-muted-foreground">
                        {new Date(resource.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* Open link — both roles */}
                          <Button variant="ghost" size="icon" asChild aria-label="Open resource">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          {/* Delete — admin only */}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(resource)}
                              aria-label="Delete resource"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No resources found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add Resource Dialog — admin only */}
      {isAdmin && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Resource</DialogTitle>
              <DialogDescription>Add a new resource for your students.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input placeholder="e.g. Mathematics Study Guide" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} /></FormControl>
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
                        <Textarea placeholder="Brief description..." className="resize-none" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course ID (optional)</FormLabel>
                      <FormControl><Input placeholder="Link to a specific course" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Resource'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation — admin only */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ResourcesPage;
