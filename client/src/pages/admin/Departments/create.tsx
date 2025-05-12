import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import DepartmentForm from '@/components/departments/form';

export default function CreateDepartment() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Create Department"
        subtitle={`Create a new department`}
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
        <DepartmentForm />
      </Card>
    </div>
  );
}
