import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import useFetch from '@/hooks/useFetch';
import { User } from '@/types';
import NotFound from '../../NotFound';
import UserDetails from '@/components/users/details';

export default function ViewUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: user, loading: isLoading } = useFetch<User>(`/users/${id}`);
  if (isLoading) {
    return <Spinner />;
  }
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
        title="Add User"
        subtitle="Create a new user"
        actions={
          <Button variant="secondary" onClick={() => navigate('/admin/users')}>
            Back to Users
          </Button>
        }
      />
      <Card>
        <UserDetails user={user} />
      </Card>
    </div>
  );
}
