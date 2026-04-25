import { useUserContext } from '@/features/dashboard';
import DashboardPage from '@/features/dashboard/ui/DashboardPage';
import OrgAdminDashboardPage from './OrgAdminDashboardPage';
import StudentOrgDashboardPage from './StudentOrgDashboardPage';

const DashboardRouter = () => {
  const { user, userLoading } = useUserContext();

  // Wait for user to resolve before deciding which dashboard to show,
  // so we never briefly flash the wrong one.
  if (userLoading) return null;

  if (user?.organizationRole === 'org_admin') return <OrgAdminDashboardPage />;
  if (user?.organizationId) return <StudentOrgDashboardPage />;
  return <DashboardPage />;
};

export default DashboardRouter;
