import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Course, User } from '../../types';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import ReactSelect from 'react-select';

const schema = z.object({
  name: z.string().min(1, 'Course name is required'),
  code: z.string().min(1, 'Course code is required'),
  credits: z.coerce
    .number()
    .min(1, 'Credits must be at least 1')
    .int('Credits must be a whole number'),
  lecturerId: z.string().min(1, 'Lecturer is required'),
});

type FormData = z.infer<typeof schema>;

interface UserResponse {
  users: User[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
}
interface CourseFormProps {
  course?: Course; // Optional course prop for editing
}

const CourseForm: React.FC<CourseFormProps> = ({ course }) => {
  const navigate = useNavigate();
  const {
    data: { users: lecturers } = { users: [] },
    loading: lecturersLoading,
  } = useFetch<UserResponse>('/users?role=Staff'); // Fetch only staff who can be lecturers

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset, // To reset form after submission or for default values
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: course?.name || '',
      code: course?.code || '',
      credits: course?.credits || 0,
      lecturerId: course?.lecturer?.id?.toString() || '',
    },
  });

  // Effect to update form default values if the course prop changes (e.g., when editing)
  useEffect(() => {
    if (course) {
      reset({
        name: course.name || '',
        code: course.code || '',
        credits: course.credits || 0,
        lecturerId: course.lecturer?.id?.toString() || '',
      });
    }
  }, [course, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Ensure credits is a number if not already coerced by Zod (though z.coerce should handle it)
    const payload = {
      ...data,
      credits: Number(data.credits),
      // lecturerId is already a string from the form, which is fine if your backend expects string ID
      // If backend expects number for lecturerId, parse it: lecturerId: parseInt(data.lecturerId)
    };

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

  if (lecturersLoading) {
    return <Spinner />;
  }

  const lecturerOptions = lecturers.map((lecturer) => ({
    value: `${lecturer.staff?.id}`,
    label: `${lecturer.staff?.firstName || 'N/A'} ${
      lecturer.staff?.lastName || 'N/A'
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
          <div className="flex items-start flex-col justify-center">
            <label
              htmlFor="lecturerId"
              className="block text-sm pb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              Lecturer
            </label>
            <ReactSelect
              options={lecturerOptions}
              defaultValue={lecturerOptions.find(
                (option) => option.value === `${course?.lecturer?.id}`
              )}
              onChange={(option) => {
                setValue('lecturerId', option?.value || '');
              }}
              className="w-full"
            />
          </div>
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
