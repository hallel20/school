import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import { Eye, CheckCircle, PlusCircle } from 'lucide-react';
import {
  AcademicSession,
  AllowedCoursesApiResponseItem,
  Course,
  Semesters,
} from '@/types';
import useFetch from '@/hooks/useFetch';
import { useSettings } from '@/hooks/useSettings';
import { getOrdinal } from '@/utils/getOrdinal';
import CustomSelect, { Option } from '@/components/ui/ReSelect';
import toast from 'react-hot-toast';

const getSemesterEnumValue = (
  index: number,
  semestersPerSession: number
): Semesters | undefined => {
  const semesterValues = Object.values(Semesters);

  // Adjust index to match array indices (starting from 0)
  const adjustedIndex = index;

  // Check if the index is within the valid range of the enum and the session
  if (
    adjustedIndex >= 0 &&
    adjustedIndex < semestersPerSession &&
    adjustedIndex < semesterValues.length
  ) {
    return semesterValues[adjustedIndex] as Semesters;
  }
};

const CoursesList = () => {
  const [registeredCourses, setRegisteredCourses] = useState();
  const [availableCourses, setAvailableCourses] = useState<Course[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>();
  const [selectedSemester, setSelectedSemester] = useState<string>();
  const navigate = useNavigate();

  const { settings } = useSettings();
  const semestersPerSession = settings?.semestersPerSession || 0;

  // Mock data for dropdowns

  const { data: coursesToRegister } = useFetch<AllowedCoursesApiResponseItem>(
    '/students/courses/available'
  );

  useEffect(() => {
    if (coursesToRegister) {
      const courses = coursesToRegister.allowedEntries?.map(
        (entry) => entry.course
      );
      console.log(coursesToRegister);
      setAvailableCourses(courses);
    }
  }, [coursesToRegister]);

  const { data: academicSessionsData, loading: academicSessionsLoading } =
    useFetch<AcademicSession[]>('/academic/sessions');

  const sessionOptions: Option[] =
    academicSessionsData?.map((session) => {
      let label = session.name;
      if (session.id === settings?.currentAcademicSessionId) {
        label = label + ' ' + '(Current)';
      }
      return {
        value: session.id.toString(),
        label,
      };
    }) || [];

  const semesterOptions = useMemo(
    () =>
      Array.from({ length: semestersPerSession }, (_, i) => {
        const val = getSemesterEnumValue(i, semestersPerSession);
        let label = `${getOrdinal(i + 1)} Semester`;
        if (i === settings?.currentSemester) {
          label = label + ' ' + '(Current)';
        }
        return { value: val as string, label };
      }).filter((opt) => opt.value),
    [semestersPerSession]
  );

  const registeredColumns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Course Name', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
    // {
    //   header: 'Lecturer',
    //   accessor: (course: Course) => course.lecturer?.firstName,
    // },
    {
      header: 'Actions',
      accessor: (course: Course) => (
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
    // {
    //   header: 'Lecturer',
    //   accessor: (course: Course) => course.lecturer?.firstName,
    // },
    {
      header: 'Actions',
      accessor: (course: Course) => (
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

  const handleRegisterCourse = (course: Course) => {
    setIsRegistering(true);
    // toast.promise()

    // Simulate API call
    setTimeout(() => {
      // Add to registered courses
      // setRegisteredCourses((prev) => [...prev, course]);

      // Remove from available courses
      setAvailableCourses((prev) => prev?.filter((c) => c.id !== course.id));

      setIsRegistering(false);
    }, 1000);
  };

  const handleSessionChange = (option: Option | null) => {
    if (!option) {
      setSelectedSemester(undefined);
    }
    setSelectedSession(option ? option.value : undefined);
  };

  const handleSemesterChange = (option: Option | null) => {
    setSelectedSemester(option ? option.value : undefined);
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="My Courses"
        subtitle="View your registered courses and register for new ones"
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="session-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Academic Session
            </label>
            <CustomSelect
              inputId="session-filter"
              options={sessionOptions}
              value={
                sessionOptions.find((opt) => opt.value === selectedSession) ||
                null
              }
              onChange={handleSessionChange}
              isLoading={academicSessionsLoading}
              isClearable
              placeholder="Select session..."
            />
          </div>

          <div>
            <label
              htmlFor="semester-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Semester
            </label>
            <CustomSelect
              inputId="semester-filter"
              options={semesterOptions}
              value={
                semesterOptions.find((opt) => opt.value === selectedSemester) ||
                null
              }
              onChange={handleSemesterChange}
              isDisabled={!selectedSession}
              isClearable
              placeholder="Select semester..."
            />
          </div>
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
  return (
    <div className="p-4">Course Details (Not fully implemented in demo)</div>
  );
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
