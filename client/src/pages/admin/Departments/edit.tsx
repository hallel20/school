import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import { Department } from '@/types';
import Spinner from '@/components/ui/Spinner';
import useFetch from '@/hooks/useFetch';
import DepartmentForm from '@/components/departments/form';
import AdminNotFound from '@/components/AdminNotFound';

export default function EditDepartment() {
  const navigate = useNavigate();
  const id = useParams().id;

  const { data: department, loading } = useFetch<Department>('/departments/' + id);

  if (loading) return <Spinner />;

  if (!department) {
    return (
      <AdminNotFound
        id={String(id)}
        title="Department"
        route="departments"
        dashboard="admin"
      />
    );
  }

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Edit Department"
        subtitle={`Edit department ${department?.code} - ${department?.name}`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/departments')}
          >
            Back to Departments
          </Button>
        }
      />
      <Card>
        <DepartmentForm department={department} />
      </Card>
    </div>
  );
}
