import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import UserForm from '@/components/users/form';
import Card from '@/components/ui/Card';
import { Staff } from '@/types';
import Spinner from '@/components/ui/Spinner';
import useFetch from '@/hooks/useFetch';
import NotFound from '../../NotFound';

export default function EditStaff() {
  const navigate = useNavigate();
  const id = useParams().id;

  const { data: staff, loading } = useFetch<Staff>('/staff/' + id);

  if (loading) return <Spinner />;

  if (!staff) {
    return (
      <div className="px-4 py-6">
        <PageHeader
          title="Staff not found"
          subtitle={`Staff ${id} not found`}
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/staff')}
            >
              Back to Staffs
            </Button>
          }
        />
        <NotFound />
      </div>
    );
  }

  const user = staff.user!;
  user.staff = staff;

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Edit Staff"
        subtitle={`Edit staff ${staff?.id}, ${staff.user?.email}`}
        actions={
          <Button variant="secondary" onClick={() => navigate('/admin/staff')}>
            Back to Staff
          </Button>
        }
      />
      <Card>
        <UserForm user={user} account="Staff" />
      </Card>
    </div>
  );
}
