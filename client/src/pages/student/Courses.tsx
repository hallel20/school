import { useEffect, useMemo, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { Eye, PlusCircle } from 'lucide-react';
import { Checkbox } from '@mui/material';
import api from '@/services/api';
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
  const [registeredCourses, setRegisteredCourses] = useState<
    Course[] | undefined
  >(undefined);
  const [availableCourses, setAvailableCourses] = useState<
    Course[] | undefined
  >(undefined);
  const [isLoadingRegistered, setIsLoadingRegistered] = useState(false);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | undefined>(
    undefined
  );
  const [selectedSemester, setSelectedSemester] = useState<string | undefined>(
    undefined
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

  const navigate = useNavigate();
  const { settings } = useSettings();
  const semestersPerSession = settings?.semestersPerSession || 0;

  const { data: academicSessionsData, loading: academicSessionsLoading } =
    useFetch<AcademicSession[]>('/academic/sessions');

  useEffect(() => {
    if (settings) {
      if (settings.currentAcademicSessionId) {
        setSelectedSession(settings.currentAcademicSessionId.toString());
      }
      if (
        settings.currentSemester !== undefined &&
        settings.currentSemester !== null &&
        semestersPerSession > 0
      ) {
        const currentSemesterValue = getSemesterEnumValue(
          settings.currentSemester,
          semestersPerSession
        );
        if (currentSemesterValue) {
          setSelectedSemester(currentSemesterValue);
        }
      }
    }
  }, [settings, semestersPerSession]);

  const sessionOptions: Option[] = useMemo(
    () =>
      academicSessionsData?.map((session) => {
        let label = session.name;
        if (
          session.id.toString() ===
          settings?.currentAcademicSessionId?.toString()
        ) {
          label = `${label} (Current)`;
        }
        return {
          value: session.id.toString(),
          label,
        };
      }) || [],
    [academicSessionsData, settings?.currentAcademicSessionId]
  );

  const semesterOptions = useMemo(() => {
    const isCurrentSessionSelected = sessionOptions
      .find((opt) => opt.value === selectedSession)
      ?.label.includes('(Current)');

    return Array.from({ length: semestersPerSession }, (_, i) => {
      const semesterValue = getSemesterEnumValue(i, semestersPerSession);
      let label = `${getOrdinal(i + 1)} Semester`;
      if (isCurrentSessionSelected && settings?.currentSemester === i) {
        label = `${label} (Current)`;
      }
      return { value: semesterValue as string, label };
    }).filter((opt) => opt.value);
  }, [
    semestersPerSession,
    settings?.currentSemester,
    selectedSession,
    sessionOptions,
  ]);

  const fetchAllCourses = useCallback(async () => {
    if (!selectedSession || !selectedSemester) {
      setRegisteredCourses(undefined);
      setAvailableCourses(undefined);
      setSelectedCourseIds([]);
      return;
    }
    setIsLoadingRegistered(true);
    setIsLoadingAvailable(true);
    setSelectedCourseIds([]);

    let fetchedRegisteredCourses: Course[] = [];
    let fetchedAvailableCoursesFromApi: Course[] = [];

    try {
      const regPath = `/students/courses/registered?academicSessionId=${selectedSession}&semester=${selectedSemester}`;
      const regResponse = await api.get<Course[]>(regPath);
      fetchedRegisteredCourses = regResponse.data || [];
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to load registered courses.'
      );
      // Keep fetchedRegisteredCourses as []
    } finally {
      setIsLoadingRegistered(false);
    }

    try {
      const availPath = `/students/courses/available?academicSessionId=${selectedSession}&semester=${selectedSemester}`;
      const availResponse = await api.get<AllowedCoursesApiResponseItem>(
        availPath
      );
      fetchedAvailableCoursesFromApi =
        availResponse.data.allowedEntries?.map((entry) => entry.course) || [];
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to load available courses.'
      );
      // Keep fetchedAvailableCoursesFromApi as []
    } finally {
      setIsLoadingAvailable(false);
    }

    // Set registered courses state
    setRegisteredCourses(fetchedRegisteredCourses);

    // Filter available courses to exclude those already registered
    const registeredCourseIds = new Set(
      fetchedRegisteredCourses.map((course) => course.id)
    );
    const trulyAvailableCourses = fetchedAvailableCoursesFromApi.filter(
      (course) => !registeredCourseIds.has(course.id)
    );
    setAvailableCourses(trulyAvailableCourses);
  }, [selectedSession, selectedSemester]);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

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

  const handleToggleSelectAll = () => {
    if (!availableCourses || availableCourses.length === 0) return;
    if (selectedCourseIds.length === availableCourses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(availableCourses.map((course) => course.id));
    }
  };

  const handleToggleCourseSelection = (courseId: number) => {
    setSelectedCourseIds((prevSelected) =>
      prevSelected.includes(courseId)
        ? prevSelected.filter((id) => id !== courseId)
        : [...prevSelected, courseId]
    );
  };

  const availableColumns = [
    {
      id: 'selection-checkbox',
      header: () => (
        <Checkbox
          checked={
            availableCourses
              ? selectedCourseIds.length === availableCourses.length &&
                availableCourses.length > 0
              : false
          }
          indeterminate={
            availableCourses
              ? selectedCourseIds.length > 0 &&
                selectedCourseIds.length < availableCourses.length
              : false
          }
          onChange={handleToggleSelectAll}
          disabled={
            !availableCourses ||
            availableCourses.length === 0 ||
            isLoadingAvailable ||
            isRegistering
          }
          size="small"
        />
      ),
      accessor: (course: Course) => (
        <Checkbox
          checked={selectedCourseIds.includes(course.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleToggleCourseSelection(course.id);
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={isLoadingAvailable || isRegistering}
          size="small"
        />
      ),
    },
    { header: 'Code', accessor: 'code' },
    { header: 'Course Name', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
  ];

  const handleBatchRegisterCourses = async () => {
    if (
      selectedCourseIds.length === 0 ||
      !selectedSession ||
      !selectedSemester
    ) {
      toast.error('No courses selected or session/semester missing.');
      return;
    }
    setIsRegistering(true);
    try {
      await api.post('/students/courses/register', {
        courseIds: selectedCourseIds,
        academicSessionId: selectedSession,
        semester: selectedSemester,
      });
      toast.success('Courses registered successfully!');
      fetchAllCourses(); // Re-fetch data which also clears selectedCourseIds
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to register courses.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSessionChange = (option: Option | null) => {
    if (!option) {
      setSelectedSemester(undefined);
    }
    setSelectedSession(option ? option.value : undefined);
    setSelectedCourseIds([]);
  };

  const handleSemesterChange = (option: Option | null) => {
    setSelectedSemester(option ? option.value : undefined);
    setSelectedCourseIds([]);
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
          isLoading={isLoadingRegistered}
          onRowClick={(course) => navigate(`/student/courses/${course.id}`)}
          emptyMessage="No courses registered for this semester"
        />
      </Card>

      <Card
        title="Available Courses for Registration"
        footer={
          availableCourses &&
          availableCourses.length > 0 && (
            <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="mr-4 text-sm text-gray-500 dark:text-gray-400">
                Max Units: {settings?.maximumCreditUnit || 0}
              </span>
              <Button
                variant="primary"
                leftIcon={<PlusCircle size={16} />}
                onClick={handleBatchRegisterCourses}
                isLoading={isRegistering}
                disabled={
                  selectedCourseIds.length === 0 ||
                  isRegistering ||
                  isLoadingAvailable
                }
              >
                Register Selected ({selectedCourseIds.length})
              </Button>
            </div>
          )
        }
      >
        <Table
          columns={availableColumns}
          data={availableCourses}
          keyField="id"
          isLoading={isLoadingAvailable || isRegistering}
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
