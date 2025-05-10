import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import CourseForm from '../../../components/courses/form';

export default function AddCourse() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Add Course"
        subtitle={`Add a new course`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/courses')}
          >
            Back to Courses
          </Button>
        }
      />
      <Card>
        <CourseForm />
      </Card>
    </div>
  );
}
