import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import UserForm from '@/components/users/form';
import Card from '@/components/ui/Card';
import { User } from '@/types';
import Spinner from '@/components/ui/Spinner';
import useFetch from '@/hooks/useFetch';
import NotFound from '../../NotFound';

export default function EditUser() {
  const navigate = useNavigate();
  const id = useParams().id;

  const { data: user, loading } = useFetch<User>('/users/' + id);

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <div className="px-4 py-6">
        <PageHeader
          title="User not found"
          subtitle={`User ${id} not found`}
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/users')}
            >
              Back to Users
            </Button>
          }
        />
        <NotFound />
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Edit User"
        subtitle={`Edit user ${user?.id}, ${user?.email}`}
        actions={
          <Button variant="secondary" onClick={() => navigate('/admin/users')}>
            Back to Users
          </Button>
        }
      />
      <Card>
        <UserForm user={user} />
      </Card>
    </div>
  );
}
