import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import CustomSelect from '@/components/ui/ReSelect';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { Faculty, Department, Semesters, years } from '@/types';
import { toast } from 'react-hot-toast';
import { getOrdinal } from '@/utils/getOrdinal'; // Assuming you have this utility
import api from '@/services/api'; // Your API service
import { Filter, RotateCcw } from 'lucide-react';
import { Option } from '@/components/ui/ReSelect';

interface SelectOption {
  value: string;
  label: string;
}

interface AllowedCourseDetail {
  id: number;
  code: string;
  title: string;
  credits: number;
}

interface AllowedCoursesApiResponseItem {
  id: number;
  departmentId: number;
  yearLevel: years;
  semester: Semesters;
  allowedEntries: Array<{
    id: number;
    course: AllowedCourseDetail;
  }>;
}

const yearLevelOptions: SelectOption[] = [
  { value: 'first', label: '1st Year' },
  { value: 'second', label: '2nd Year' },
  { value: 'third', label: '3rd Year' },
  { value: 'fourth', label: '4th Year' },
  { value: 'fifth', label: '5th Year' },
  { value: 'sixth', label: '6th Year' },
];

// Helper to map semester index to Semesters enum value
const getSemesterEnumValue = (index: number): Semesters | undefined => {
  const semesterValues = Object.values(Semesters);

  // Adjust index to match array indices (starting from 0)
  const adjustedIndex = index;

  // Check if the index is within the valid range of the enum and the session
  if (adjustedIndex >= 0 && adjustedIndex < semesterValues.length) {
    return semesterValues[adjustedIndex] as Semesters;
  }
};

const AllowedCoursesViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(
    null
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);
  const [selectedYearLevel, setSelectedYearLevel] = useState<string | null>(
    null
  );

  const [allowedCoursesData, setAllowedCoursesData] = useState<
    AllowedCoursesApiResponseItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const semestersPerSession = settings?.semestersPerSession || 0;

  // Fetch Faculties
  useEffect(() => {
    const fetchFaculties = async () => {
      setIsLoadingFaculties(true);
      try {
        const response = await api.get('/faculties');
        setFaculties(response.data.faculties || []);
      } catch (error) {
        toast.error('Failed to fetch faculties.');
        console.error(error);
      } finally {
        setIsLoadingFaculties(false);
      }
    };
    fetchFaculties();
  }, []);

  // Fetch Departments when Faculty changes
  useEffect(() => {
    if (selectedFacultyId) {
      const fetchDepartments = async () => {
        setIsLoadingDepartments(true);
        setDepartments([]); // Clear previous departments
        setSelectedDepartmentId(null); // Reset department selection
        setAllowedCoursesData([]); // Clear course data
        try {
          const response = await api.get(
            `/departments?facultyId=${selectedFacultyId}`
          );
          setDepartments(response.data.departments || []);
        } catch (error) {
          toast.error('Failed to fetch departments for the selected faculty.');
          console.error(error);
        } finally {
          setIsLoadingDepartments(false);
        }
      };
      fetchDepartments();
    } else {
      setDepartments([]);
      setSelectedDepartmentId(null);
    }
  }, [selectedFacultyId]);

  const handleFetchAllowedCourses = async () => {
    if (!selectedDepartmentId || !selectedYearLevel) {
      toast.error('Please select a department and year level.');
      return;
    }
    setIsLoading(true);
    setAllowedCoursesData([]);
    try {
      const response = await api.get<AllowedCoursesApiResponseItem[]>(
        `/admin/allowed-courses?departmentId=${selectedDepartmentId}&yearLevel=${selectedYearLevel}`
      );
      setAllowedCoursesData(response.data || []);
      if (!response.data || response.data.length === 0) {
        toast.success('No allowed courses found for the selected criteria.');
      }
    } catch (error) {
      toast.error('Failed to fetch allowed courses.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const facultyOptions = useMemo(
    () => faculties.map((f) => ({ value: f.id.toString(), label: f.name })),
    [faculties]
  );
  const departmentOptions = useMemo(
    () => departments.map((d) => ({ value: d.id.toString(), label: d.name })),
    [departments]
  );

  const coursesBySemester = useMemo(() => {
    const grouped: Record<string, AllowedCourseDetail[]> = {};
    allowedCoursesData.forEach((rule) => {
      if (rule.semester) {
        grouped[rule.semester] = (grouped[rule.semester] || []).concat(
          rule.allowedEntries.map((entry) => entry.course)
        );
      }
    });
    return grouped;
  }, [allowedCoursesData]);

  const courseTableColumns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Title', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
  ];

  const handleClearFilters = () => {
    setSelectedFacultyId(null);
    setSelectedDepartmentId(null);
    setSelectedYearLevel(null);
    setAllowedCoursesData([]);
    setDepartments([]); // Also clear departments list
  };

  return (
    <div className="p-3">
      <PageHeader
        title="View Allowed Courses"
        subtitle="Filter by department and year to see courses allowed per semester."
        actions={
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/departments/courses/manage')}
            >
              Manage
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/departments')}
            >
              Back to Departments
            </Button>
          </div>
        }
      />
      <Card>
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <CustomSelect
              label="Faculty"
              options={facultyOptions}
              value={
                facultyOptions.find((opt) => opt.value === selectedFacultyId) ||
                null
              }
              onChange={(opt: Option | null) =>
                setSelectedFacultyId(opt ? opt.value : null)
              }
              isLoading={isLoadingFaculties}
              placeholder="Select Faculty..."
            />
            <CustomSelect
              label="Department"
              options={departmentOptions}
              value={
                departmentOptions.find(
                  (opt) => opt.value === selectedDepartmentId
                ) || null
              }
              onChange={(opt: Option | null) =>
                setSelectedDepartmentId(opt ? opt.value : null)
              }
              isDisabled={!selectedFacultyId || isLoadingDepartments}
              isLoading={isLoadingDepartments}
              placeholder="Select Department..."
            />
            <CustomSelect
              label="Year Level"
              options={yearLevelOptions}
              value={
                yearLevelOptions.find(
                  (opt) => opt.value === selectedYearLevel
                ) || null
              }
              onChange={(opt: Option | null) =>
                setSelectedYearLevel(opt ? opt.value : null)
              }
              placeholder="Select Year Level..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              leftIcon={<RotateCcw size={16} />}
            >
              Clear Filters
            </Button>
            <Button
              onClick={handleFetchAllowedCourses}
              disabled={
                isLoading || !selectedDepartmentId || !selectedYearLevel
              }
              leftIcon={<Filter size={16} />}
            >
              {isLoading ? 'Loading...' : 'Fetch Allowed Courses'}
            </Button>
          </div>
        </div>

        {semestersPerSession > 0 &&
          selectedDepartmentId &&
          selectedYearLevel && (
            <div className="mt-6">
              {isLoading && (
                <p className="text-center py-4">Loading courses...</p>
              )}
              {!isLoading &&
                allowedCoursesData.length === 0 &&
                selectedDepartmentId &&
                selectedYearLevel && (
                  <p className="text-center py-4 text-gray-600 dark:text-gray-400">
                    No allowed courses data to display for the current
                    selection. Try fetching.
                  </p>
                )}
              {!isLoading &&
                allowedCoursesData.length > 0 &&
                Array.from({ length: semestersPerSession }).map((_, index) => {
                  const semesterEnumValue = getSemesterEnumValue(index);

                  const coursesForThisSemester =
                    (semesterEnumValue
                      ? coursesBySemester[semesterEnumValue]
                      : []) || [];
                  const semesterTitle = `${getOrdinal(index + 1)} Semester`;

                  return (
                    <div key={semesterEnumValue} className="mb-8">
                      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                        {semesterTitle}
                      </h3>
                      {coursesForThisSemester.length > 0 ? (
                        <Table
                          columns={courseTableColumns}
                          data={coursesForThisSemester}
                          keyField="id"
                          //  pageSize={10} // Optional: if your Table supports pagination
                        />
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          No courses specified for this semester.
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
      </Card>
    </div>
  );
};

export default AllowedCoursesViewPage;
