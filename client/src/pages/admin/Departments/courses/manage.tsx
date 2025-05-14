import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import CustomSelect from '@/components/ui/ReSelect';
import Button from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import {
  Faculty,
  Department,
  Semesters,
  years,
  AllowedCourseDetail,
} from '@/types';
import { toast } from 'react-hot-toast';
import { getOrdinal } from '@/utils/getOrdinal';
import api from '@/services/api';
import { PlusCircle, Trash2, Save, Download, RotateCcw } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

// From AllowedCoursesViewPage - ensure consistency or centralize
interface ApiAllowedCoursesRule {
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

const AllowedCoursesManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  // --- State for Target Rule Definition ---
  const [targetFacultyId, setTargetFacultyId] = useState<string | null>(null);
  const [targetDepartmentId, setTargetDepartmentId] = useState<string | null>(
    null
  );
  const [targetYearLevel, setTargetYearLevel] = useState<years | null>(null);
  const [targetSemester, setTargetSemester] = useState<Semesters | null>(null);

  // --- State for Course Picker ---
  const [sourceFacultyId, setSourceFacultyId] = useState<string | null>(null);
  const [sourceDepartmentId, setSourceDepartmentId] = useState<string | null>(
    null
  );
  const [sourceCourseId, setSourceCourseId] = useState<string | null>(null);

  // --- State for Data & UI ---
  const [allFaculties, setAllFaculties] = useState<Faculty[]>([]);
  const [targetDepartments, setTargetDepartments] = useState<Department[]>([]);
  const [sourceDepartments, setSourceDepartments] = useState<Department[]>([]);
  const [sourceCourses, setSourceCourses] = useState<AllowedCourseDetail[]>([]); // Using AllowedCourseDetail for consistency

  const [selectedCoursesForRule, setSelectedCoursesForRule] = useState<
    AllowedCourseDetail[]
  >([]);

  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [isLoadingTargetDepts, setIsLoadingTargetDepts] = useState(false);
  const [isLoadingSourceDepts, setIsLoadingSourceDepts] = useState(false);
  const [isLoadingSourceCourses, setIsLoadingSourceCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRule, setIsLoadingRule] = useState(false);

  const semestersPerSession = settings?.semestersPerSession || 0;

  // --- Memoized Select Options ---
  const facultyOptions = useMemo(
    () => allFaculties.map((f) => ({ value: f.id.toString(), label: f.name })),
    [allFaculties]
  );
  const targetDepartmentOptions = useMemo(
    () =>
      targetDepartments.map((d) => ({ value: d.id.toString(), label: d.name })),
    [targetDepartments]
  );
  const sourceDepartmentOptions = useMemo(
    () =>
      sourceDepartments.map((d) => ({ value: d.id.toString(), label: d.name })),
    [sourceDepartments]
  );
  const sourceCourseOptions = useMemo(
    () =>
      sourceCourses.map((c) => ({
        value: c.id.toString(),
        label: `${c.code} - ${c.name}`,
      })),
    [sourceCourses]
  );
  const semesterOptions = useMemo(
    () =>
      Array.from({ length: semestersPerSession }, (_, i) => {
        const val = getSemesterEnumValue(i, semestersPerSession);
        return { value: val as string, label: `${getOrdinal(i + 1)} Semester` };
      }).filter((opt) => opt.value),
    [semestersPerSession]
  );

  // --- Effects for fetching data ---
  useEffect(() => {
    const fetchFaculties = async () => {
      setIsLoadingFaculties(true);
      try {
        const response = await api.get('/faculties');
        setAllFaculties(response.data.faculties || []);
      } catch {
        toast.error('Failed to fetch faculties.');
      } finally {
        setIsLoadingFaculties(false);
      }
    };
    fetchFaculties();
  }, []);

  const fetchDepartments = async (
    facultyId: string,
    setDepts: React.Dispatch<React.SetStateAction<Department[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!facultyId) {
      setDepts([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/departments?facultyId=${facultyId}`);
      setDepts(response.data.departments || []);
    } catch {
      toast.error('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(
      targetFacultyId!,
      setTargetDepartments,
      setIsLoadingTargetDepts
    );
    setTargetDepartmentId(null); // Reset dependent select
  }, [targetFacultyId]);

  useEffect(() => {
    fetchDepartments(
      sourceFacultyId!,
      setSourceDepartments,
      setIsLoadingSourceDepts
    );
    setSourceDepartmentId(null); // Reset dependent select
    setSourceCourses([]);
    setSourceCourseId(null);
  }, [sourceFacultyId]);

  const maximumCreditUnit = settings?.maximumCreditUnit || 22;
  const totalCredits = selectedCoursesForRule.reduce(
    (acc, course) => acc + course.credits,
    0
  );

  useEffect(() => {
    const fetchCourses = async () => {
      if (!sourceDepartmentId) {
        setSourceCourses([]);
        return;
      }
      setIsLoadingSourceCourses(true);
      try {
        // Assuming an endpoint like /departments/:id/courses or /courses?departmentId=X
        const response = await api.get(
          `/courses?departmentId=${sourceDepartmentId}`
        );
        setSourceCourses(response.data.courses || []); // Adjust based on your API response structure for courses
      } catch {
        toast.error('Failed to fetch courses for selection.');
      } finally {
        setIsLoadingSourceCourses(false);
      }
    };
    fetchCourses();
    setSourceCourseId(null); // Reset course selection
  }, [sourceDepartmentId]);

  // --- Handlers ---
  const handleAddCourseToRule = () => {
    if (!sourceCourseId) {
      toast.error('Please select a course to add.');
      return;
    }
    const courseToAdd = sourceCourses.find(
      (c) => c.id.toString() === sourceCourseId
    );

    if (totalCredits + (courseToAdd?.credits || 0) > maximumCreditUnit) {
      toast.error(
        'Maximum credit unit exceeded, please remove a course or change setting!'
      );
      return;
    }
    if (
      courseToAdd &&
      !selectedCoursesForRule.find((c) => c.id === courseToAdd.id)
    ) {
      setSelectedCoursesForRule((prev) => [...prev, courseToAdd]);
    } else if (courseToAdd) {
      toast.error('Course already added to the list.');
    }
  };

  const handleRemoveCourseFromRule = (courseId: number) => {
    setSelectedCoursesForRule((prev) => prev.filter((c) => c.id !== courseId));
  };

  const handleLoadExistingRule = async () => {
    if (!targetDepartmentId || !targetYearLevel || !targetSemester) {
      toast.error(
        'Please select target Department, Year Level, and Semester to load a rule.'
      );
      return;
    }
    setIsLoadingRule(true);
    setSelectedCoursesForRule([]); // Clear previous
    try {
      const response = await api.get<ApiAllowedCoursesRule[]>(
        `/admin/allowed-courses?departmentId=${targetDepartmentId}&yearLevel=${targetYearLevel}`
      );
      const ruleForSemester = response.data.find(
        (rule) => rule.semester === targetSemester
      );
      if (ruleForSemester && ruleForSemester.allowedEntries) {
        setSelectedCoursesForRule(
          ruleForSemester.allowedEntries.map((entry) => entry.course)
        );
        toast.success('Existing rule loaded.');
      } else {
        toast(
          'No existing rule found for this selection. You can create a new one.'
        );
      }
    } catch {
      toast.error('Failed to load existing rule.');
    } finally {
      setIsLoadingRule(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!targetDepartmentId || !targetYearLevel || !targetSemester) {
      toast.error(
        'Please define the target Department, Year Level, and Semester.'
      );
      return;
    }
    if (selectedCoursesForRule.length === 0) {
      toast(
        'You are about to save an empty list of allowed courses. Continue if this is intended.'
      );
      // Optionally, you can prevent saving an empty list without confirmation
    }

    setIsSubmitting(true);
    try {
      const payload = {
        departmentId: Number(targetDepartmentId),
        yearLevel: targetYearLevel,
        semester: targetSemester,
        allowedCourses: selectedCoursesForRule.map((c) => c.id),
      };
      // This endpoint should handle upsert logic (create or update)
      await api.post('/admin/allowed-courses', payload); // Assuming your updateAllowedCourses is at this POST endpoint
      toast.success('Allowed courses saved successfully!');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to save allowed courses.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearTargetForm = () => {
    setTargetFacultyId(null);
    setTargetDepartmentId(null);
    setTargetYearLevel(null);
    setTargetSemester(null);
    setSelectedCoursesForRule([]);
    setTargetDepartments([]);
  };

  const isTargetFormComplete =
    targetDepartmentId && targetYearLevel && targetSemester;

  return (
    <div className="p-4">
      <PageHeader
        title="Manage Allowed Courses"
        subtitle="Define which courses are allowed for a specific department, year, and semester."
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/departments/courses')}
          >
            Back
          </Button>
        }
      />
      <Card>
        <div className="p-4 md:p-6">
          {/* Section 1: Target Rule Definition */}
          <section className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              1. Define Target Rule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <CustomSelect
                label="Target Faculty"
                options={facultyOptions}
                value={
                  facultyOptions.find((opt) => opt.value === targetFacultyId) ||
                  null
                }
                onChange={(opt) => setTargetFacultyId(opt ? opt.value : null)}
                isLoading={isLoadingFaculties}
                placeholder="Select Faculty..."
              />
              <CustomSelect
                label="Target Department"
                options={targetDepartmentOptions}
                value={
                  targetDepartmentOptions.find(
                    (opt) => opt.value === targetDepartmentId
                  ) || null
                }
                onChange={(opt) =>
                  setTargetDepartmentId(opt ? opt.value : null)
                }
                isDisabled={!targetFacultyId || isLoadingTargetDepts}
                isLoading={isLoadingTargetDepts}
                placeholder="Select Department..."
              />
              <CustomSelect
                label="Target Year Level"
                options={yearLevelOptions}
                value={
                  yearLevelOptions.find(
                    (opt) => opt.value === targetYearLevel
                  ) || null
                }
                onChange={(opt) =>
                  setTargetYearLevel(opt ? (opt.value as years) : null)
                }
                placeholder="Select Year Level..."
              />
              <CustomSelect
                label="Target Semester"
                options={semesterOptions}
                value={
                  semesterOptions.find((opt) => opt.value === targetSemester) ||
                  null
                }
                onChange={(opt) =>
                  setTargetSemester(opt ? (opt.value as Semesters) : null)
                }
                placeholder="Select Semester..."
                isDisabled={semestersPerSession === 0}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleClearTargetForm}
                leftIcon={<RotateCcw size={16} />}
              >
                Clear Target
              </Button>
              <Button
                onClick={handleLoadExistingRule}
                disabled={!isTargetFormComplete || isLoadingRule}
                leftIcon={<Download size={16} />}
              >
                {isLoadingRule
                  ? 'Loading Rule...'
                  : 'Load Existing / Define New'}
              </Button>
            </div>
          </section>

          {/* Section 2: Course Picker (Enabled after target is defined) */}
          {isTargetFormComplete && (
            <section className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                2. Select Courses to Add
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end">
                <CustomSelect
                  label="Course's Faculty"
                  options={facultyOptions}
                  value={
                    facultyOptions.find(
                      (opt) => opt.value === sourceFacultyId
                    ) || null
                  }
                  onChange={(opt) => setSourceFacultyId(opt ? opt.value : null)}
                  isLoading={isLoadingFaculties}
                  placeholder="Select Faculty..."
                />
                <CustomSelect
                  label="Course's Department"
                  options={sourceDepartmentOptions}
                  value={
                    sourceDepartmentOptions.find(
                      (opt) => opt.value === sourceDepartmentId
                    ) || null
                  }
                  onChange={(opt) =>
                    setSourceDepartmentId(opt ? opt.value : null)
                  }
                  isDisabled={!sourceFacultyId || isLoadingSourceDepts}
                  isLoading={isLoadingSourceDepts}
                  placeholder="Select Department..."
                />
                <CustomSelect
                  label="Course"
                  options={sourceCourseOptions}
                  value={
                    sourceCourseOptions.find(
                      (opt) => opt.value === sourceCourseId
                    ) || null
                  }
                  onChange={(opt) => setSourceCourseId(opt ? opt.value : null)}
                  isDisabled={!sourceDepartmentId || isLoadingSourceCourses}
                  isLoading={isLoadingSourceCourses}
                  placeholder="Select Course..."
                />
                <Button
                  onClick={handleAddCourseToRule}
                  disabled={!sourceCourseId}
                  leftIcon={<PlusCircle size={16} />}
                  className="self-end mb-1 md:mb-0" // Align button with selects
                >
                  Add Course
                </Button>
              </div>
            </section>
          )}

          {/* Section 3: List of Courses Selected for the Rule */}
          {isTargetFormComplete && selectedCoursesForRule.length > 0 && (
            <section className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Courses Selected for{' '}
                {
                  targetDepartmentOptions.find(
                    (d) => d.value === targetDepartmentId
                  )?.label
                }{' '}
                -{' '}
                {
                  yearLevelOptions.find((y) => y.value === targetYearLevel)
                    ?.label
                }{' '}
                -{' '}
                {semesterOptions.find((s) => s.value === targetSemester)?.label}
              </h3>
              <ul className="space-y-2">
                {selectedCoursesForRule.map((course) => (
                  <li
                    key={course.id}
                    className="flex justify-between items-center p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <span>
                      {course.code} - {course.name} (Credits: {course.credits})
                    </span>
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => handleRemoveCourseFromRule(course.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end gap-3 mt-3">
                <span className="bg-gray-600 text-gray-200 dark:bg-gray-200 dark:text-gray-600 px-2 rounded-md">Total Credit Unit: &nbsp;{totalCredits}</span>
                <span className="bg-gray-600 text-gray-200 dark:bg-gray-200 dark:text-gray-600 px-2 rounded-md">Maximum Credit Unit: &nbsp;{maximumCreditUnit}</span>
              </div>
            </section>
          )}
          {isTargetFormComplete && selectedCoursesForRule.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              No courses added to this rule yet. Use the 'Select Courses to Add'
              section.
            </p>
          )}

          {/* Section 4: Save Button */}
          {isTargetFormComplete && (
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveChanges}
                disabled={isSubmitting || isLoadingRule}
                leftIcon={<Save size={16} />}
              >
                {isSubmitting ? 'Saving...' : 'Save Allowed Courses'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AllowedCoursesManagePage;
