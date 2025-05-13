import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Course, Department, Faculty, Staff } from '../../types'; // Assuming Department and Faculty are defined in types
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import CustomSelect from '../ui/ReSelect';

const schema = z.object({
  name: z.string().min(1, 'Course name is required'),
  code: z.string().min(1, 'Course code is required'),
  credits: z.coerce
    .number()
    .min(1, 'Credits must be at least 1')
    .int('Credits must be a whole number'),
  lecturerId: z.coerce.number().min(1, 'Lecturer is required'), // Coerce to number
  facultyId: z.coerce.number().min(1, 'Faculty is required'),
  departmentId: z.coerce.number().min(1, 'Department is required'), // Use 'departmentId' as per Course type
});

type FormData = z.infer<typeof schema>;

interface StaffResponse {
  staff: Staff[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
}

// Assuming Faculty type is imported from '../../types'
interface FacultyResponse {
  faculties: Faculty[];
  // Optional: Add pagination fields if your API for faculties returns them
}
interface DepartmentForFacultyResponse { // For fetching departments based on faculty
  departments: Department[];
}
interface CourseFormProps {
  course?: Course; // Optional course prop for editing
}

const CourseForm: React.FC<CourseFormProps> = ({ course }) => {
  const navigate = useNavigate();
  const {
    data: facultyData,
    loading: facultiesLoading,
  } = useFetch<FacultyResponse>('/faculties'); // Fetch all faculties
  const faculties = facultyData?.faculties || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // State for departments loaded based on selected faculty
  const [facultyDepartments, setFacultyDepartments] = useState<Department[]>([]);
  const [facultyDepartmentsLoading, setFacultyDepartmentsLoading] =
    useState(false);
  // State for lecturers loaded based on selected department
  const [departmentLecturers, setDepartmentLecturers] = useState<Staff[]>([]);
  const [departmentLecturersLoading, setDepartmentLecturersLoading] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset, // To reset form after submission or for default values
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: course?.name || '',
      code: course?.code || '',
      credits: course?.credits || 0,
      facultyId: Number(course?.department?.facultyId) || undefined,
      departmentId: undefined, // Will be set after faculty departments are loaded
      lecturerId: undefined, // Will be set after department lecturers are loaded
    },
  });

  // Effect to update form default values if the course prop changes (e.g., when editing)
  useEffect(() => {
    if (course) {
      reset({
        name: course.name || '',
        code: course.code || '',
        credits: course.credits || 0,
        facultyId: Number(course.department?.facultyId) || undefined,
        departmentId: undefined, // Will be set by the faculty-department effect
        lecturerId: undefined, // Will be set by the department-lecturer effect
      });
    } else {
      // For new course, reset all fields
      reset({
        name: '',
        code: '',
        credits: 0,
        lecturerId: undefined,
        facultyId: undefined,
        departmentId: undefined,
      });
    }
  }, [course, reset]);

  const watchedFacultyId = watch('facultyId');
  const watchedDepartmentId = watch('departmentId');

  // Effect to fetch departments when facultyId changes
  useEffect(() => {
    if (watchedFacultyId) {
      setFacultyDepartmentsLoading(true);
      setFacultyDepartments([]);
      setDepartmentLecturers([]); // Clear lecturers too

      api
        .get<DepartmentForFacultyResponse>(`/departments?facultyId=${watchedFacultyId}`)
        .then((response) => {
          const fetchedDepts = response.data.departments || response.data; // Adapt if API structure differs
          setFacultyDepartments(fetchedDepts);
          // Pre-select department if editing and course.departmentId matches a loaded department
          if (course?.departmentId && fetchedDepts.some(d => d.id === course.departmentId)) {
            setValue('departmentId', course.departmentId, { shouldValidate: true });
          }
        })
        .catch((err) => {
          toast.error('Failed to load departments for the selected faculty.');
          console.error('Error fetching departments:', err);
        })
        .finally(() => setFacultyDepartmentsLoading(false));
    } else {
      setFacultyDepartments([]); // Clear departments if no faculty
      setDepartmentLecturers([]); // Clear lecturers if no faculty
    }
  }, [watchedFacultyId, setValue, course]);

  // Effect to fetch lecturers when departmentId changes
  useEffect(() => {
    if (watchedDepartmentId) {
      setDepartmentLecturersLoading(true);
      setDepartmentLecturers([]);
      
      // Assuming API endpoint /users?role=Staff&departmentId=ID
      api
        .get<StaffResponse>(`/staff?&departmentId=${watchedDepartmentId}`)
        .then((response) => {
          const fetchedLecturers = response.data.staff || response.data; // Adapt if API structure differs
          setDepartmentLecturers(fetchedLecturers);
          // Pre-select lecturer if editing and course.lecturer.id matches a loaded lecturer
          if (course?.lecturer?.id && fetchedLecturers.some(l => l.id === course.lecturer.id)) {
            setValue('lecturerId', course.lecturer.id, { shouldValidate: true });
          }
        })
        .catch((err) => {
          toast.error('Failed to load lecturers for the selected department.');
          console.error('Error fetching lecturers:', err);
        })
        .finally(() => setDepartmentLecturersLoading(false));
    } else {
      setDepartmentLecturers([]); // Clear lecturers if no department
    }
  }, [watchedDepartmentId, setValue, course]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // With z.coerce in schema, 'data' will have numbers for credits, lecturerId, departmentId
    const payload = { ...data };

    try {
      if (course) {
        // Editing existing course
        await api.put(`/courses/${course.id}`, payload);
      } else {
        // Creating new course
        await api.post('/courses', payload);
      }
      toast.success(`Course ${course ? 'updated' : 'created'} successfully`);
      navigate('/admin/courses'); // Redirect to the courses list page
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${course ? 'update' : 'create'} course`;
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (facultiesLoading) { // Only initial loading for faculties
    return <Spinner />;
  }


  const facultyOptions = faculties.map((fac) => ({
    value: fac.id.toString(),
    label: fac.name,
  }));

  const departmentOptions = facultyDepartments.map((dept) => ({
    value: dept.id.toString(), // ReactSelect expects string values for options
    label: dept.name,
  }));

  const lecturerOptions = departmentLecturers.map((lecturer) => ({
    value: `${lecturer?.id}`, // Ensure staff and id exist
    label: `${lecturer?.firstName || 'N/A'} ${
      lecturer?.lastName || 'N/A'
    } (Staff)`,
  }));

  return (
    <div className="container mx-auto p-4 mt-7 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {course ? 'Edit Course' : 'Add New Course'}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              id="name"
              label="Course Name"
              type="text"
              {...register('name')}
              error={errors.name?.message}
              fullWidth
            />
          </div>
          <div>
            <Input
              id="code"
              label="Course Code"
              type="text"
              {...register('code')}
              error={errors.code?.message}
              fullWidth
            />
          </div>
          <div>
            <Input
              id="credits"
              label="Credits"
              type="number"
              {...register('credits')}
              error={errors.credits?.message}
              fullWidth
            />
          </div>
          {/* Faculty Selection */}
          <div className="md:col-span-2"> {/* Span across two columns for better flow */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Step 1: Select a Faculty to see available Departments.</p>
            <label htmlFor="facultyId" className="block text-sm pb-1 font-medium text-gray-700 dark:text-gray-300">Faculty</label>
            <CustomSelect
              options={facultyOptions}
              inputId="facultyId"
              value={facultyOptions.find(opt => Number(opt.value) === watch('facultyId')) || null}
              onChange={(option) => {
                setValue('facultyId', Number(option?.value) || 0, { shouldValidate: true });
                // Department will be reset by the useEffect watching facultyId
              }}
              className="w-full"
            />
            {errors.facultyId && <p className="text-sm text-red-600 mt-1">{errors.facultyId.message}</p>}
          </div>

          {/* Department Selection - Conditional */}
          {watchedFacultyId && !facultiesLoading && ( // Ensure faculty isn't still loading from initial fetch
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Step 2: Select a Department to see available Lecturers.</p>
              <label htmlFor="departmentId" className="block text-sm pb-1 font-medium text-gray-700 dark:text-gray-300">Department</label>
              {facultyDepartmentsLoading ? (
                <div className="flex items-center justify-start p-2 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[42px]">
                  <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    {/* SVG Spinner */}
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading departments...</span>
                </div>
              ) : facultyDepartments.length > 0 ? (
                <CustomSelect
                  options={departmentOptions}
                  inputId="departmentId"
                  value={departmentOptions.find(opt => Number(opt.value) === watch('departmentId')) || null}
                  onChange={(option) => {
                    setValue('departmentId', Number(option?.value) || 0, { shouldValidate: true });
                  }}
                  className="w-full"
                  isDisabled={facultyDepartmentsLoading} // Disable while loading, though covered by conditional render
                />
              ) : !facultyDepartmentsLoading && facultyDepartments.length === 0 && ( // Only show if not loading and empty
                <div className="flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[42px]">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No departments found for this faculty.
                  </span>
                </div>
              )}
              {errors.departmentId && !facultyDepartmentsLoading && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.departmentId.message}
                </p>
              )}
            </div>
          )}

          {/* Lecturer Selection - Conditional */}
          {watchedDepartmentId && !facultyDepartmentsLoading && facultyDepartments.length > 0 && (
             <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Step 3: Select a Lecturer for this course.</p>
              <label htmlFor="lecturerId" className="block text-sm pb-1 font-medium text-gray-700 dark:text-gray-300">Lecturer</label>
              {departmentLecturersLoading ? (
                 <div className="flex items-center justify-start p-2 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[42px]">
                  <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    {/* SVG Spinner */}
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading lecturers...</span>
                </div>
              ) : departmentLecturers.length > 0 ? (
                <CustomSelect
                  options={lecturerOptions}
                  inputId="lecturerId"
                  value={lecturerOptions.find(opt => Number(opt.value) === watch('lecturerId')) || null}
                  onChange={(option) => {
                    setValue('lecturerId', Number(option?.value) || 0, { shouldValidate: true });
                  }}
                  className="w-full"
                  isDisabled={departmentLecturersLoading}
                />
              ) : !departmentLecturersLoading && departmentLecturers.length === 0 && ( // Only show if not loading and empty
                <div className="flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[42px]">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No lecturers found for this department. Select a department first or try a different one.
                  </span>
                </div>
              )}
              {errors.lecturerId && !departmentLecturersLoading && <p className="text-sm text-red-600 mt-1">{errors.lecturerId.message}</p>}
            </div>
          )}

        </div>

        {submitError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">
              {submitError}
            </p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-800"
          >
            {isSubmitting
              ? 'Submitting...'
              : course
              ? 'Update Course'
              : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
