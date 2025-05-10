import { Link } from 'react-router-dom';
import { Course } from '../../types';
import Modal from '../ui/modal';

interface ViewCourseProps {
  course: Course;
  onClose: () => void;
  open: boolean;
}

export default function ViewCourse({ course, onClose, open }: ViewCourseProps) {
  return (
    <Modal title="Course Details" open={open} onOpenChange={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">{course.name}</h2>
          <p>
            <strong>Course Code:</strong> {course.code}
          </p>
          <p>
            <strong>Credits:</strong> {course.credits}
          </p>
        </div>
        <Link
          to={`/admin/courses/edit/${course.id}`}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          Edit Course
        </Link>
      </div>
    </Modal>
  );
}
