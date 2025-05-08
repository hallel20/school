import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import { Eye, CheckCircle, PlusCircle } from 'lucide-react';

// Mock data
const mockRegisteredCourses = [
  { id: 1, code: 'CS101', name: 'Introduction to Computer Science', credits: 3, lecturer: 'Prof. Johnson' },
  { id: 2, code: 'MATH201', name: 'Advanced Mathematics', credits: 4, lecturer: 'Dr. Smith' },
  { id: 3, code: 'ENG101', name: 'English Literature', credits: 3, lecturer: 'Prof. Williams' },
  { id: 4, code: 'PHYS101', name: 'Physics I', credits: 4, lecturer: 'Dr. Brown' },
  { id: 5, code: 'CS301', name: 'Database Systems', credits: 3, lecturer: 'Prof. Davis' },
];

const mockAvailableCourses = [
  { id: 6, code: 'CS201', name: 'Data Structures', credits: 3, lecturer: 'Dr. Wilson' },
  { id: 7, code: 'MATH301', name: 'Calculus III', credits: 4, lecturer: 'Prof. Miller' },
  { id: 8, code: 'PHYS201', name: 'Physics II', credits: 4, lecturer: 'Dr. Taylor' },
  { id: 9, code: 'ENG201', name: 'Technical Writing', credits: 3, lecturer: 'Prof. Thomas' },
];

const CoursesList = () => {
  const [registeredCourses, setRegisteredCourses] = useState(mockRegisteredCourses);
  const [availableCourses, setAvailableCourses] = useState(mockAvailableCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedSession, setSelectedSession] = useState('1');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const navigate = useNavigate();

  // Mock data for dropdowns
  const sessionOptions = [
    { value: '1', label: '2023/2024' },
    { value: '2', label: '2022/2023' },
  ];
  
  const semesterOptions = [
    { value: '1', label: 'First Semester' },
    { value: '2', label: 'Second Semester' },
  ];

  const registeredColumns = [
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
              navigate(`/student/courses/${course.id}`);
            }}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  const availableColumns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Course Name', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
    { header: 'Lecturer', accessor: 'lecturer' },
    {
      header: 'Actions',
      accessor: (course) => (
        <Button
          size="sm"
          variant="success"
          leftIcon={<PlusCircle size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleRegisterCourse(course);
          }}
        >
          Register
        </Button>
      ),
    },
  ];

  const handleRegisterCourse = (course) => {
    setIsRegistering(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add to registered courses
      setRegisteredCourses(prev => [...prev, course]);
      
      // Remove from available courses
      setAvailableCourses(prev => prev.filter(c => c.id !== course.id));
      
      setIsRegistering(false);
    }, 1000);
  };

  return (
    <div className="px-4 py-6">
      <PageHeader 
        title="My Courses" 
        subtitle="View your registered courses and register for new ones"
      />
      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Academic Session"
            options={sessionOptions}
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            fullWidth
          />
          
          <Select
            label="Semester"
            options={semesterOptions}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            fullWidth
          />
        </div>
      </Card>
      
      <Card title="Registered Courses" className="mb-6">
        <Table
          columns={registeredColumns}
          data={registeredCourses}
          keyField="id"
          isLoading={isLoading}
          onRowClick={(course) => navigate(`/student/courses/${course.id}`)}
          emptyMessage="No courses registered for this semester"
        />
      </Card>
      
      <Card title="Available Courses">
        <Table
          columns={availableColumns}
          data={availableCourses}
          keyField="id"
          isLoading={isLoading || isRegistering}
          emptyMessage="No additional courses available for registration"
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