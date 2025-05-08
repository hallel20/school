import { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import LineChart from '../../components/charts/LineChart';
import { Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';

const Overview = () => {
  // Mock data - in a real app this would come from API calls
  const [stats, setStats] = useState({
    totalStudents: 254,
    totalStaff: 45,
    totalCourses: 68,
    activeSessions: 2,
  });

  const [studentEnrollmentData, setStudentEnrollmentData] = useState([
    { year: '2021/2022', value: 210 },
    { year: '2022/2023', value: 232 },
    { year: '2023/2024', value: 245 },
    { year: '2024/2025', value: 254 },
  ]);

  const [courseDistributionData, setCourseDistributionData] = useState([
    { name: 'Science', value: 25 },
    { name: 'Arts', value: 18 },
    { name: 'Commerce', value: 15 },
    { name: 'Engineering', value: 10 },
  ]);

  const [staffDistributionData, setStaffDistributionData] = useState([
    { name: 'Professors', value: 12 },
    { name: 'Lecturers', value: 18 },
    { name: 'Teaching Assistants', value: 15 },
  ]);

  const [performanceData, setPerformanceData] = useState([
    { semester: 'Sem 1', pass: 85, fail: 15 },
    { semester: 'Sem 2', pass: 88, fail: 12 },
    { semester: 'Sem 3', pass: 82, fail: 18 },
    { semester: 'Sem 4', pass: 90, fail: 10 },
  ]);

  return (
    <div className="px-4 py-6">
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Overview of school statistics and performance"
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.totalStaff}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Staff
            </p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.totalCourses}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Courses
            </p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900 mr-4">
            <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {stats.activeSessions}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active Sessions
            </p>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Student Enrollment Trend" className="overflow-hidden">
          <LineChart
            data={studentEnrollmentData}
            xAxisKey="year"
            lines={[{ dataKey: 'value', name: 'Students' }]}
            height={300}
          />
        </Card>
        
        <Card title="Course Distribution" className="overflow-hidden">
          <PieChart
            data={courseDistributionData}
            height={300}
          />
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Staff Distribution" className="overflow-hidden">
          <PieChart
            data={staffDistributionData}
            height={300}
          />
        </Card>
        
        <Card title="Student Performance" className="overflow-hidden">
          <BarChart
            data={performanceData}
            xAxisKey="semester"
            bars={[
              { dataKey: 'pass', name: 'Pass Rate (%)', color: '#10B981' },
              { dataKey: 'fail', name: 'Fail Rate (%)', color: '#EF4444' }
            ]}
            height={300}
          />
        </Card>
      </div>
    </div>
  );
};

export default Overview;