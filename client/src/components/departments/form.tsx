import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Department, Faculty } from '../../types'; // Added Faculty
import type { Staff } from '../../types';
import CustomSelect from '../ui/ReSelect';

// Define the Zod schema for Department fields
const DepartmentFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Department name must be at least 3 characters' }),
  code: z
    .string()
    .min(2, { message: 'Department code must be at least 2 characters' })
    .max(10, { message: 'Department code must be at most 10 characters' }),
  hodId: z // Changed from deanId to hodId
    .union([z.string(), z.number()])
    .nullable()
    .transform((val) =>
      val !== null && val !== undefined ? Number(val) : null
    ), // Ensure it's a number or null
  facultyId: z // Added facultyId
    .union([z.string(), z.number()])
    .refine((val) => val !== null && val !== undefined && val !== '', {
      message: 'Faculty is required',
    })
    .transform((val) => Number(val)), // Ensure it's a number
});

type DepartmentFormData = z.infer<typeof DepartmentFormSchema>;

interface DepartmentFormProps {
  department?: Department; // Optional department prop for editing
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ department }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    // @ts-ignore
    resolver: zodResolver(DepartmentFormSchema),
    defaultValues: {
      name: department?.name || '',
      code: department?.code || '',
      hodId: department?.hodId || null,
      facultyId: department?.facultyId || undefined, // Initialize facultyId
    },
  });

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // For disabling button during submission
  const [facultyList, setFacultyList] = useState<Faculty[]>([]); // State for faculties
  const [submitError, setSubmitError] = useState<string | null>(null); // For displaying submission errors

  useEffect(() => {
    // Fetch staff list for the Dean dropdown
    const fetchStaff = async () => {
      try {
        const response = await api.get(`/staff?department=${department?.id}`); // Adjust endpoint as necessary
        setStaffList(response.data.staff || response.data || []);
      } catch (error) {
        console.error('Failed to fetch staff:', error);
        toast.error('Failed to load staff for HOD selection.');
      }
    };

    const fetchFaculties = async () => {
      try {
        const response = await api.get('/faculties'); // Endpoint to fetch faculties
        setFacultyList(response.data.faculties || response.data || []);
      } catch (error) {
        console.error('Failed to fetch faculties:', error);
        toast.error('Failed to load faculties.');
      }
    };

    fetchStaff();
    fetchFaculties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useNavigate();
  const hodId = watch('hodId');
  const facultyId = watch('facultyId');

  useEffect(() => {
    const fetchStaff = async () => {
      if (facultyId) {
        const validHods = await api.get(`/staff?faculty=${facultyId}`);
        setStaffList(validHods.data.staff || validHods.data || []);
      }
    };
    fetchStaff();
  }, [facultyId]);

  const onSubmit: SubmitHandler<DepartmentFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const submissionData = {
      name: data.name,
      code: data.code,
      hodId: data.hodId ? Number(data.hodId) : null,
      facultyId: Number(data.facultyId), // Ensure facultyId is a number
    };

    console.log('Submitting department data:', submissionData);

    if (department) {
      // Editing existing department
      try {
        await api.put(`/departments/${department.id}`, submissionData); // Adjust endpoint
        toast.success('Department updated successfully');
        navigate('/admin/departments'); // Redirect to departments list
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
      // Creating new department
      try {
        await api.post('/departments', submissionData); // Adjust endpoint
        toast.success('Department created successfully');
        navigate('/admin/departments'); // Redirect to departments list
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
        {department ? 'Edit Department' : 'Add New Department'}
      </h1>
      {/* @ts-ignore */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Department Name
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
              Department Code
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
              htmlFor="facultyId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Faculty <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={
                facultyList
                  .map((faculty) => ({
                    value: String(faculty.id),
                    label: `${faculty.name} (${faculty.code})`,
                  }))
                  .find(
                    (option) => option.value === String(watch('facultyId'))
                  ) || null
              }
              onChange={(value) => {
                setValue('facultyId', value ? Number(value.value) : 1, {
                  shouldValidate: true,
                });
              }}
              options={[
                { value: '', label: 'Select a Faculty' },
                ...facultyList.map((faculty) => ({
                  value: String(faculty.id),
                  label: `${faculty.name} (${faculty.code})`,
                })),
              ]}
            />
            {errors.facultyId && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.facultyId.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="hodId" // Changed from deanId
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Head of Department (Optional)
            </label>
            <CustomSelect
              value={
                staffList
                  .map((staff) => ({
                    value: String(staff.id),
                    label: `${staff?.firstName} ${staff?.lastName}`,
                  }))
                  .find((option) => option.value === String(hodId)) || null // Changed from deanId
              }
              onChange={(value) => {
                setValue('hodId', value ? Number(value.value) : null); // Changed from deanId
              }}
              options={[
                { value: '', label: 'Select an HOD (Optional)' }, // Default empty option
                ...staffList.map((staff) => ({
                  value: String(staff.id),
                  label: `${staff.firstName} ${staff.lastName}`,
                })),
              ]}
            />
            {errors.hodId && ( // Changed from deanId
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.hodId.message}
              </p>
            )}
          </div>
        </div>

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
              ? department
                ? 'Updating...'
                : 'Creating...'
              : department
              ? 'Update Department'
              : 'Create Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
