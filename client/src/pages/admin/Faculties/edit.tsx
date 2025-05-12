import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import { Faculty } from '@/types';
import Spinner from '@/components/ui/Spinner';
import useFetch from '@/hooks/useFetch';
import FacultyForm from '@/components/faculties/form';
import AdminNotFound from '@/components/AdminNotFound';

export default function EditFaculty() {
  const navigate = useNavigate();
  const id = useParams().id;

  const { data: faculty, loading } = useFetch<Faculty>('/faculties/' + id);

  if (loading) return <Spinner />;

  if (!faculty) {
    return (
      <AdminNotFound
        id={String(id)}
        title="Faculty"
        route="faculties"
        dashboard="admin"
      />
    );
  }

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Edit Faculty"
        subtitle={`Edit faculty ${faculty?.code} - ${faculty?.name}`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/faculties')}
          >
            Back to faculties
          </Button>
        }
      />
      <Card>
        <FacultyForm faculty={faculty} />
      </Card>
    </div>
  );
}
