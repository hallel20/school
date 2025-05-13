import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import UserForm from '@/components/users/form';
import Card from '@/components/ui/Card';
import { Student } from '@/types';
import Spinner from '@/components/ui/Spinner';
import useFetch from '@/hooks/useFetch';
import NotFound from '../../NotFound';

export default function EditStudents() {
  const navigate = useNavigate();
  const id = useParams().id;

  const { data: student, loading } = useFetch<Student>('/students/' + id);

  if (loading) return <Spinner />;

  if (!student) {
    return (
      <div className="px-4 py-6">
        <PageHeader
          title="Student not found"
          subtitle={`Student ${id} not found`}
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/students')}
            >
              Back to Studentss
            </Button>
          }
        />
        <NotFound />
      </div>
    );
  }

  const user = student.user!;
  user.student = student;

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Edit Student"
        subtitle={`Edit student ${student?.id}, ${student.user?.email}`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/students')}
          >
            Back to Students
          </Button>
        }
      />
      <Card>
        <UserForm user={user} account="Student" />
      </Card>
    </div>
  );
}
