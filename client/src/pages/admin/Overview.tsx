import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import LineChart from '../../components/charts/LineChart';
import { Users, BookOpen, Building } from 'lucide-react';
import useFetch from '@/hooks/useFetch';

type CountResponse = {
  studentsCount: number;
  staffCount: number;
  courseCount: number;
  departmentCount: number;
  facultyCount: number;
};

interface DistRes {
  name: string;
  value: number;
}

interface StaffDistRes {
  name: string;
  value: number;
}

// --- NEW TYPES FOR FETCHED DATA ---
interface EnrollmentTrendData {
  year: string;
  value: number;
}

interface PerformanceData {
  semester: string;
  pass: number;
  fail: number;
}

const Overview = () => {
  const { data: stats, loading: statsLoading } =
    useFetch<CountResponse>('/admin/count');

  // --- UPDATED FETCH CALLS ---
  const { data: studentEnrollmentData, loading: enrollmentLoading } = useFetch<
    EnrollmentTrendData[]
  >('/admin/enrollment-trend');

  const { data: courseDistributionData, loading: courseDistributionLoading } =
    useFetch<DistRes[]>('/admin/course-distribution');

  const { data: staffDistributionData, loading: staffDistributionLoading } =
    useFetch<StaffDistRes[]>('/admin/staff-distribution');

  const { data: performanceData, loading: performanceLoading } =
    useFetch<PerformanceData[]>('/admin/performance');

  // Note: The useState declarations for mock data are now removed
  // as useFetch will manage the data and loading states directly.

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of school statistics and performance"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="flex items-center animate-pulse">
              <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 mr-4">
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <div>
                <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-1.5"></div>
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </Card>
          ))
        ) : (
          <>
            <Card className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {stats?.studentsCount}
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
                  {stats?.staffCount}
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
                  {stats?.courseCount}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Courses
                </p>
              </div>
            </Card>

            <Card className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900 mr-4">
                <Building className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {stats?.departmentCount}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Departments
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Student Enrollment Trend" className="overflow-hidden">
          {enrollmentLoading ? ( // Add loading state for enrollment data
            <div className="flex justify-center items-center h-[300px] animate-pulse">
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : studentEnrollmentData && studentEnrollmentData.length > 0 ? (
            <LineChart
              data={studentEnrollmentData}
              xAxisKey="year"
              lines={[{ dataKey: 'value', name: 'Students' }]}
              height={300}
            />
          ) : (
            <div className="flex justify-center items-center h-[300px] text-gray-500">
              No enrollment data available
            </div>
          )}
        </Card>

        <Card title="Course Distribution" className="overflow-hidden">
          {courseDistributionLoading ? (
            <div className="flex justify-center items-center h-[300px] animate-pulse">
              <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          ) : courseDistributionData && courseDistributionData.length > 0 ? (
            <PieChart data={courseDistributionData} height={300} />
          ) : (
            <div className="flex justify-center items-center h-[300px] text-gray-500">
              No data available
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Staff Distribution" className="overflow-hidden">
          {staffDistributionLoading ? (
            <div className="flex justify-center items-center h-[300px] animate-pulse">
              <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          ) : staffDistributionData && staffDistributionData.length > 0 ? (
            <PieChart data={staffDistributionData} height={300} />
          ) : (
            <div className="flex justify-center items-center h-[300px] text-gray-500">
              No data available
            </div>
          )}
        </Card>

        <Card title="Student Performance" className="overflow-hidden">
          {performanceLoading ? ( // Add loading state for performance data
            <div className="flex justify-center items-center h-[300px] animate-pulse">
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : performanceData && performanceData.length > 0 ? (
            <BarChart
              data={performanceData}
              xAxisKey="semester"
              bars={[
                { dataKey: 'pass', name: 'Pass Rate (%)', color: '#10B981' },
                { dataKey: 'fail', name: 'Fail Rate (%)', color: '#EF4444' },
              ]}
              height={300}
            />
          ) : (
            <div className="flex justify-center items-center h-[300px] text-gray-500">
              No performance data available
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Overview;
