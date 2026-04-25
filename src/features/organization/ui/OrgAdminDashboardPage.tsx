import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, ClipboardList, FolderOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/common/Layout';
import { useUserContext } from '@/features/dashboard';
import { useOrgAdminDashboard } from '../hooks/useOrgDashboard';

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

const OrgAdminDashboardPage = () => {
  const { user } = useUserContext();
  const { stats, loading, error } = useOrgAdminDashboard();
  const navigate = useNavigate();

  const quickStats = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: <Users className="h-4 w-4" /> },
    { label: 'Active Students', value: stats?.activeStudents ?? 0, icon: <TrendingUp className="h-4 w-4" /> },
    { label: 'Total Courses', value: stats?.totalCourses ?? 0, icon: <BookOpen className="h-4 w-4" /> },
    {
      label: 'Avg. Org Score',
      value: stats ? `${Math.round(stats.avgOrganizationScore)}%` : '0%',
      icon: <ClipboardList className="h-4 w-4" />,
    },
  ];

  return (
    <Layout
      title="Dashboard"
      headerActions={
        <Button onClick={() => navigate('/students')}>
          <Users className="mr-2 h-4 w-4" />
          Manage Students
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

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: 'View All Students', icon: <Users className="mr-2 h-4 w-4" />, href: '/students' },
                      { label: 'Manage Courses', icon: <BookOpen className="mr-2 h-4 w-4" />, href: '/courses' },
                      { label: 'Manage Assessments', icon: <ClipboardList className="mr-2 h-4 w-4" />, href: '/assessments' },
                      { label: 'Manage Resources', icon: <FolderOpen className="mr-2 h-4 w-4" />, href: '/resources' },
                    ].map((action) => (
                      <Button
                        key={action.href}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate(action.href)}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Organization Summary</CardTitle>
                    <CardDescription>Current state of your organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: 'Total Assessments', value: stats?.totalAssessments ?? 0 },
                        { label: 'Total Resources', value: stats?.totalResources ?? 0 },
                        { label: 'Avg. Organization Score', value: `${Math.round(stats?.avgOrganizationScore ?? 0)}%` },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions in your organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    Activity feed will appear here once students and courses are active.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Layout>
  );
};

export default OrgAdminDashboardPage;
