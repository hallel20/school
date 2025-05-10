import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../../hooks/useFetch';
import { Course } from '../../../types';
import Pagination from '../../../components/ui/pagination';
import { useState } from 'react';
import ViewCourse from '../../../components/modals/ViewCourse';
import { useDeleteConfirmation } from '../../../hooks/useDeleteConfirmation';
import api from '../../../services/api';

interface CourseResponse {
  courses: Course[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCourses: number;
}

const CoursesList = () => {
  const {
    data: { courses, totalPages } = {
      courses: [],
      totalPages: 0,
    },
    loading: isLoading,
    refetch,
  } = useFetch<CourseResponse>('/courses'); // Custom hook to fetch courses
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const { openDeleteConfirmation, DeleteModal } = useDeleteConfirmation();

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Course Name', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
    {
      header: 'Lecturer',
      accessor: (course: Course) =>
        course.lecturer?.firstName + ' ' + course.lecturer?.lastName,
    },
    {
      header: 'Actions',
      accessor: (course: Course) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              handleViewCourse(course);
            }}
          >
            <Eye size={16} />
          </button>
          <button
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/courses/edit/${course.id}`);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirmation({
                title: 'Delete Course',
                message: `Are you sure you want to delete course ${course.code}?`,
                onConfirm: async () => {
                  await toast.promise(api.delete(`/courses/${course.id}`), {
                    loading: 'Deleting...',
                    success: `Deleted course ${course.name}`,
                    error: `Failed to delete user ${course.name}`,
                  });
                  refetch();
                },
              });
            }}
          >
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleViewCourse = (course: Course) => {
    setCourse(course);
    setOpen(true);
  };

  return (
    <>
      <div className="px-4 py-6">
        <PageHeader
          title="Course Management"
          subtitle="View and manage all courses"
          actions={
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/admin/courses/add')}
            >
              Add Course
            </Button>
          }
        />

        <Card>
          <Table
            columns={columns}
            data={courses}
            keyField="id"
            isLoading={isLoading}
            onRowClick={(course) => handleViewCourse(course as Course)}
          />
        </Card>
        <Pagination
          totalPages={totalPages}
          currentPage={1}
          onPageChange={(page) => {
            // Handle page change (not implemented in this demo)
            toast.success(`Page changed to ${page}`);
          }}
        />
      </div>
      {open && course && (
        <ViewCourse
          course={course}
          onClose={() => setOpen(false)}
          open={open}
        />
      )}
      <DeleteModal />
    </>
  );
};

export default CoursesList;
