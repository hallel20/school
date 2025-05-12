import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Faculty } from '../../types';
import type { Staff } from '../../types'; // Assuming Staff type is also in types
import CustomSelect from '../ui/ReSelect';

// Define the Zod schema for Faculty fields
const FacultyFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Faculty name must be at least 3 characters' }),
  code: z
    .string()
    .min(2, { message: 'Faculty code must be at least 2 characters' })
    .max(10, { message: 'Faculty code must be at most 10 characters' }),
  deanId: z
    .union([z.string(), z.number()])
    .nullable()
    .transform((val) =>
      val !== null && val !== undefined ? Number(val) : null
    ), // Ensure it's a number or null
});

type FacultyFormData = z.infer<typeof FacultyFormSchema>;

interface FacultyFormProps {
  faculty?: Faculty; // Optional faculty prop for editing
}

const FacultyForm: React.FC<FacultyFormProps> = ({ faculty }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FacultyFormData>({
    // @ts-ignore
    resolver: zodResolver(FacultyFormSchema),
    defaultValues: {
      name: faculty?.name || '',
      code: faculty?.code || '',
      deanId: faculty?.deanId || null,
    },
  });

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // For disabling button during submission
  const [submitError, setSubmitError] = useState<string | null>(null); // For displaying submission errors

  useEffect(() => {
    // Fetch staff list for the Dean dropdown
    const fetchStaff = async () => {
      try {
        const response = await api.get(`/staff?faculty=${faculty?.id}`); // Adjust endpoint as necessary
        setStaffList(response.data.staff || response.data || []); // Adjust based on your API response structure
      } catch (error) {
        console.error('Failed to fetch staff:', error);
        toast.error('Failed to load staff for Dean selection.');
      }
    };
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useNavigate();
  const deanId = watch('deanId');

  const onSubmit: SubmitHandler<FacultyFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const submissionData: FacultyFormData = {
      name: data.name,
      code: data.code,
      deanId: data.deanId ? Number(data.deanId) : null,
    };

    console.log('Submitting faculty data:', submissionData);

    if (faculty) {
      // Editing existing faculty
      try {
        await api.put(`/faculties/${faculty.id}`, submissionData); // Adjust endpoint
        toast.success('Faculty updated successfully');
        navigate('/admin/faculties'); // Redirect to faculties list
      } catch (error: any) {
        console.error('Submission error:', error);
        toast.error(
          error.response?.data?.message || 'An unexpected error occurred'
        );
        setSubmitError(error.message || 'An unexpected error occurred.');
        // Display error toast/message
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Creating new faculty
      try {
        await api.post('/faculties', submissionData); // Adjust endpoint
        toast.success('Faculty created successfully');
        navigate('/admin/faculties'); // Redirect to faculties list
      } catch (error: any) {
        console.error('Submission error:', error);
        toast.error(
          error.response?.data?.message || 'An unexpected error occurred'
        );
        setSubmitError(error.message || 'An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 mt-7 max-w-2xl min-h-96">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {faculty ? 'Edit Faculty' : 'Add New Faculty'}
      </h1>
      {/* @ts-ignore */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Faculty Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.name
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Faculty Code
            </label>
            <input
              id="code"
              type="text"
              {...register('code')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.code
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
            />
            {errors.code && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="deanId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Dean (Optional)
            </label>
            <CustomSelect
              value={
                staffList
                  .map((staff) => ({
                    value: String(staff.id),
                    label: `${staff?.firstName} ${staff?.lastName}`,
                  }))
                  .find((option) => option.value === String(deanId)) || null
              }
              onChange={(value) => {
                setValue('deanId', value ? Number(value.value) : null);
              }}
              options={[
                { value: '', label: 'Select a Dean (Optional)' }, // Default empty option
                ...staffList.map((staff) => ({
                  value: String(staff.id),
                  label: `${staff.firstName} ${staff.lastName}`,
                })),
              ]}
            />
            {errors.deanId && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.deanId.message}
              </p>
            )}
          </div>
        </div>

        {/* Displaying departments if editing - this is a simple display, not editable here */}
        {faculty && faculty.departments && faculty.departments.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Departments
            </h3>
            <ul className="list-disc list-inside p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              {faculty.departments.map((dept) => (
                <li
                  key={dept.id}
                  className="text-sm text-gray-600 dark:text-gray-200"
                >
                  {dept.name} ({dept.code})
                </li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">
              {submitError}
            </p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isSubmitting
              ? faculty
                ? 'Updating...'
                : 'Creating...'
              : faculty
              ? 'Update Faculty'
              : 'Create Faculty'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacultyForm;
