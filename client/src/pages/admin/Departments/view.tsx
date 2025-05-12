import { useNavigate, useParams } from 'react-router-dom';
import { Department } from '@/types';
import { DepartmentDetails } from '@/components/Department/DepartmentDetails';
import useFetch from '@/hooks/useFetch';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import AdminNotFound from '@/components/AdminNotFound';
import Card from '@/components/ui/Card';

export default function ViewDepartment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const departmentId = Number(id);

  const { data: department, loading } = useFetch<Department>(
    `/departments/${departmentId}?queryType=all`
  );

  if (loading) {
    return <Spinner />;
  }

  if (!department)
    return (
      <AdminNotFound
        id={String(departmentId)}
        title="Department"
        route="departments"
        dashboard="admin"
      />
    );

  return (
    <div className="px-4 py-6">
      <PageHeader
        title={department?.name || 'Department Details'}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/departments')}
          >
            Back to Departments
          </Button>
        }
      />
      <Card>{department && <DepartmentDetails department={department} />}</Card>
    </div>
  );
}
