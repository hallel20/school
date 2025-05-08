import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import { Eye, Users } from 'lucide-react';

// Mock data
const mockCourses = [
  { id: 1, code: 'CS101', name: 'Introduction to Computer Science', credits: 3, students: 32 },
  { id: 2, code: 'MATH201', name: 'Advanced Mathematics', credits: 4, students: 28 },
  { id: 3, code: 'CS301', name: 'Database Systems', credits: 3, students: 26 },
  { id: 4, code: 'CS401', name: 'Software Engineering', credits: 4, students: 22 },
];

const CoursesList = () => {
  const [courses, setCourses] = useState(mockCourses);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Course Name', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
    { 
      header: 'Students', 
      accessor: (course) => (
        <div className="flex items-center">
          <Users size={16} className="mr-2 text-gray-500" />
          {course.students}
        </div>
      ) 
    },
    {
      header: 'Actions',
      accessor: (course) => (
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/staff/courses/${course.id}`);
            }}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 py-6">
      <PageHeader 
        title="My Courses" 
        subtitle="View your assigned courses and manage student results"
      />
      
      <Card>
        <Table
          columns={columns}
          data={courses}
          keyField="id"
          isLoading={isLoading}
          onRowClick={(course) => navigate(`/staff/courses/${course.id}`)}
        />
      </Card>
    </div>
  );
};

const CourseView = () => {
  return <div className="p-4">Course Details (Not fully implemented in demo)</div>;
};

const Courses = () => {
  return (
    <Routes>
      <Route path="/" element={<CoursesList />} />
      <Route path="/:id" element={<CourseView />} />
    </Routes>
  );
};

export default Courses;