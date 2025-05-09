import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BarChart from '../../components/charts/BarChart';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Users, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock data
  const [stats, setStats] = useState({
    totalCourses: 4,
    totalStudents: 86,
    pendingResults: 2,
  });

  const [recentCourses, setRecentCourses] = useState([
    { id: 1, code: 'CS101', name: 'Introduction to Computer Science', students: 32 },
    { id: 2, code: 'MATH201', name: 'Advanced Mathematics', students: 28 },
    { id: 3, code: 'CS301', name: 'Database Systems', students: 26 },
  ]);

  const [performanceData, setPerformanceData] = useState([
    { course: 'CS101', A: 8, B: 10, C: 9, D: 3, F: 2 },
    { course: 'MATH201', A: 5, B: 8, C: 10, D: 4, F: 1 },
    { course: 'CS301', A: 7, B: 9, C: 6, D: 3, F: 1 },
  ]);

  return (
    <div className="px-4 py-6">
      <PageHeader 
        title={`Welcome, ${user?.firstName || 'Staff'}`} 
        subtitle="Here's an overview of your courses and student performance"
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.totalCourses}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Assigned Courses
            </p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.totalStudents}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Students
            </p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900 mr-4">
            <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.pendingResults}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pending Results
            </p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Courses */}
        <Card 
          title="Assigned Courses" 
          footer={
            <Button 
              variant="light" 
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/staff/courses')}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.students} Students</p>
                </div>
                <Button 
                  size="sm" 
                  variant="light"
                  onClick={() => navigate(`/staff/courses/${course.id}`)}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Course Performance */}
        <Card title="Grade Distribution" className="overflow-hidden">
          <BarChart
            data={performanceData}
            xAxisKey="course"
            bars={[
              { dataKey: 'A', color: '#10B981' }, // green
              { dataKey: 'B', color: '#3B82F6' }, // blue
              { dataKey: 'C', color: '#F59E0B' }, // amber
              { dataKey: 'D', color: '#F97316' }, // orange
              { dataKey: 'F', color: '#EF4444' }, // red
            ]}
            height={250}
          />
        </Card>
      </div>
    </div>
  );
};

export default Overview;