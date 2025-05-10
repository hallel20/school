import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import { Course } from '../../../types';
import Spinner from '../../../components/ui/Spinner';
import useFetch from '../../../hooks/useFetch';
import NotFound from '../../NotFound';
import CourseForm from '../../../components/courses/form';

export default function EditCourse() {
  const navigate = useNavigate();
  const id = useParams().id;

  const { data: course, loading } = useFetch<Course>('/courses/' + id);

  if (loading) return <Spinner />;

  if (!course) {
    return (
      <div className="px-4 py-6">
        <PageHeader
          title="Course not found"
          subtitle={`Course ${id} not found`}
          actions={
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/courses')}
            >
              Back to Courses
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
        title="Edit Course"
        subtitle={`Edit course ${course?.code} - ${course?.name}`}
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
        <CourseForm course={course} />
      </Card>
    </div>
  );
}
