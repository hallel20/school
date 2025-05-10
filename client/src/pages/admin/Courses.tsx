import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data
const mockCourses = [
  {
    id: 1,
    name: 'Introduction to Computer Science',
    code: 'CS101',
    credits: 3,
    lecturer: 'Prof. Johnson',
  },
  {
    id: 2,
    name: 'Advanced Mathematics',
    code: 'MATH201',
    credits: 4,
    lecturer: 'Dr. Smith',
  },
  {
    id: 3,
    name: 'English Literature',
    code: 'ENG101',
    credits: 3,
    lecturer: 'Prof. Williams',
  },
  {
    id: 4,
    name: 'Physics I',
    code: 'PHYS101',
    credits: 4,
    lecturer: 'Dr. Brown',
  },
  {
    id: 5,
    name: 'Database Systems',
    code: 'CS301',
    credits: 3,
    lecturer: 'Prof. Davis',
  },
];

const CoursesList = () => {
  const [courses, setCourses] = useState(mockCourses);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Course Name', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
    { header: 'Lecturer', accessor: 'lecturer' },
    {
      header: 'Actions',
      accessor: (course) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/courses/view/${course.id}`);
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
              // Show delete confirmation (not implemented in this demo)
              toast.success(`Delete course ${course.id}`);
            }}
          >
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
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
          onRowClick={(course) => navigate(`/admin/courses/view/${course.id}`)}
        />
      </Card>
    </div>
  );
};

const CourseView = () => {
  return <div className="p-4">Course View (Not fully implemented in demo)</div>;
};

const CourseAdd = () => {
  return <div className="p-4">Add Course Form (Not fully implemented in demo)</div>;
};

const CourseEdit = () => {
  return <div className="p-4">Edit Course Form (Not fully implemented in demo)</div>;
};

const Courses = () => {
  return (
    <Routes>
      <Route path="/" element={<CoursesList />} />
      <Route path="/view/:id" element={<CourseView />} />
      <Route path="/add" element={<CourseAdd />} />
      <Route path="/edit/:id" element={<CourseEdit />} />
    </Routes>
  );
};

export default Courses;