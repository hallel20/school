import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, GraduationCap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock data
  const [stats, setStats] = useState({
    registeredCourses: 5,
    currentSession: '2023/2024',
    currentSemester: 'First Semester',
    currentGpa: 3.7,
  });

  const [recentCourses, setRecentCourses] = useState([
    { id: 1, code: 'CS101', name: 'Introduction to Computer Science', credits: 3 },
    { id: 2, code: 'MATH201', name: 'Advanced Mathematics', credits: 4 },
    { id: 3, code: 'ENG101', name: 'English Literature', credits: 3 },
  ]);

  const [gpaData, setGpaData] = useState([
    { semester: 'Sem 1 2022', gpa: 3.5 },
    { semester: 'Sem 2 2022', gpa: 3.6 },
    { semester: 'Sem 1 2023', gpa: 3.7 },
  ]);

  const [gradeDistribution, setGradeDistribution] = useState([
    { name: 'A', value: 3 },
    { name: 'B', value: 1 },
    { name: 'C', value: 1 },
    { name: 'D', value: 0 },
    { name: 'F', value: 0 },
  ]);

  return (
    <div className="px-4 py-6">
      <PageHeader 
        title={`Welcome, ${user?.firstName || 'Student'}`} 
        subtitle="Here's an overview of your academic performance"
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.registeredCourses}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Registered Courses
            </p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
            <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.currentSession}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current Session
            </p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900 mr-4">
            <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.currentSemester}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current Semester
            </p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
            <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.currentGpa}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current GPA
            </p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Registered Courses */}
        <Card 
          title="Current Courses" 
          footer={
            <Button 
              variant="light" 
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/student/courses')}
            >
              View All Courses
            </Button>
          }
        >
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentCourses.map((course) => (
              <div key={course.id} className="py-3 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">{course.code}: {course.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.credits} Credits</p>
                </div>
                <Button 
                  size="sm" 
                  variant="light"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </Card>
        
        {/* GPA Trend */}
        <Card title="GPA Trend" className="overflow-hidden">
          <LineChart
            data={gpaData}
            xAxisKey="semester"
            lines={[{ dataKey: 'gpa', name: 'GPA', color: '#7E3AF2' }]}
            height={250}
          />
        </Card>
      </div>
      
      {/* Grade Distribution */}
      <Card title="Current Grade Distribution" className="overflow-hidden">
        <PieChart
          data={gradeDistribution}
          height={300}
        />
      </Card>
    </div>
  );
};

export default Overview;