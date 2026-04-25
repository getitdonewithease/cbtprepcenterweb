import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, Clock, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/common/Layout';
import { useUserContext } from '@/features/dashboard';
import { useStudentOrgDashboard } from '../hooks/useOrgDashboard';

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="bg-card">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-2">{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

const StudentOrgDashboardPage = () => {
  const { user } = useUserContext();
  const { stats, loading, error } = useStudentOrgDashboard();
  const navigate = useNavigate();

  const quickStats = [
    { label: 'Enrolled Courses', value: stats?.enrolledCourses ?? 0, icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Completed', value: stats?.completedAssessments ?? 0, icon: <CheckCircle2 className="h-4 w-4" /> },
    { label: 'Pending', value: stats?.pendingAssessments ?? 0, icon: <Clock className="h-4 w-4" /> },
    {
      label: 'Avg. Score',
      value: stats ? `${Math.round(stats.avgScore)}%` : '0%',
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ];

  return (
    <Layout
      title="Dashboard"
      headerActions={
        <Button variant="outline" onClick={() => navigate('/assessments')}>
          <ClipboardList className="mr-2 h-4 w-4" />
          View Assessments
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card">
                <CardContent className="p-4 flex flex-col items-center">
                  <Skeleton className="h-10 w-10 rounded-full mb-2" />
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full min-h-[400px] text-red-500">{error}</div>
      ) : (
        <>
          <section className="mb-8">
            <div className="mb-6">
              <p className="text-muted-foreground">Welcome back, {user?.firstName}</p>
              <h2 className="text-3xl font-bold">{user?.organizationName ?? 'Your Organization'}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>
          </section>

          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                  <CardDescription>Courses you're currently enrolled in</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.enrolledCourses === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      You're not enrolled in any courses yet.
                    </p>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => navigate('/courses')}>
                      View All Courses
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessments">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Assessments</CardTitle>
                  <CardDescription>Assessments you need to complete</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.pendingAssessments === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      No pending assessments.
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm">
                        You have{' '}
                        <span className="font-semibold">{stats?.pendingAssessments}</span>{' '}
                        pending assessment{stats?.pendingAssessments !== 1 ? 's' : ''}.
                      </span>
                      <Button size="sm" className="ml-auto" onClick={() => navigate('/assessments')}>
                        View
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Layout>
  );
};

export default StudentOrgDashboardPage;
