import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import FacultyForm from '@/components/faculties/form';

export default function CreateFaculty() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Create Faculty"
        subtitle={`Create a new faculty`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/faculties')}
          >
            Back to Facultys
          </Button>
        }
      />
      <Card>
        <FacultyForm />
      </Card>
    </div>
  );
}
