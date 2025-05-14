import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Department, User, Faculty } from '../../types'; // Added Faculty
import Select from '../ui/Select';
import useFetch from '@/hooks/useFetch';
import Spinner from '../ui/Spinner';
import { getOrdinal } from '@/utils/getOrdinal';

// Define the Zod schema for user fields
const baseUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().optional(),
  role: z.enum(['Student', 'Staff', 'Admin'], {
    // Keep role as required
    errorMap: () => ({ message: 'Please select a role' }),
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  update: z.boolean().optional(), // For edit mode
  position: z.enum(['lecturer', 'doctor', 'professor', 'assistant']),
  facultyId: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  yearLevel: z.enum(['first', 'second', 'third', 'fourth', 'fifth', 'sixth']),
  departmentId: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  // studentId and staffId are not part of the form input directly if auto-assigned
  // They will be added to the payload before sending to the backend if needed
});

// Refine schema to make firstName and lastName required for Student and Staff
const UserFormSchema = baseUserSchema.superRefine((data, ctx) => {
  // Make password required only if it's not an update (i.e., user prop is not provided)
  if (!data.update && (!data.password || data.password.length < 6)) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 6,
      type: 'string',
      message: 'Password must be at least 6 characters',
      inclusive: true,
    });
  }
  if (data.role === 'Student' || data.role === 'Staff') {
    if (!data.firstName || data.firstName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'First name is required for this role',
        path: ['firstName'],
      });
    }
    if (!data.lastName || data.lastName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Last name is required for this role',
        path: ['lastName'],
      });
    }
  }
  if (data.role === 'Staff') {
    if (!data.position) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Position is required for Staff role',
        path: ['position'],
      });
    }
    // If role is Student or Staff, departmentId should be required
    if (
      (['Student', 'Staff'] as Array<UserFormData['role']>).includes(
        data.role
      ) &&
      !data.departmentId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Department is required for this role',
        path: ['departmentId'],
      });
    }
    // If role is Student or Staff, facultyId should be required (as department depends on it)
    if (
      (['Student', 'Staff'] as Array<UserFormData['role']>).includes(
        data.role
      ) &&
      !data.facultyId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Faculty is required to select a department',
        path: ['facultyId'],
      });
    }
  }
});

type UserFormData = z.infer<typeof UserFormSchema>;

interface UserFormProps {
  user?: User; // Optional user prop for editing
  account?: 'Staff' | 'Student';
}

const UserForm: React.FC<UserFormProps> = ({ user, account }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch, // To watch changes in form values if needed
  } = useForm<UserFormData>({
    // @ts-ignore
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      role: user?.role || account || 'Student', // Default role
      firstName: user?.staff?.firstName || user?.student?.firstName || '',
      lastName: user?.staff?.lastName || user?.student?.lastName || '',
      position: user?.staff?.position || 'lecturer', // Default position for staff
      facultyId: Number(user?.facultyId) || null,
      yearLevel: user?.student?.levelYear || undefined,
      update: !!user, // Set to true if user is provided (edit mode)
      departmentId:
        Number(user?.staff?.departmentId) ||
        Number(user?.student?.departmentId) ||
        undefined,
    },
  });

  // State for account type, which might differ from 'role' if 'Admin' role can be 'Student' or 'Staff' type for ID purposes
  // Or, more simply, role directly dictates the type for ID generation.
  // For simplicity, let's assume 'role' directly maps to the type for ID generation for now.
  // If 'Admin' users don't get a student/staff ID, this logic will simplify.
  // The original form had a separate 'accountType' state. Let's keep it for clarity on ID assignment.
  const [accountType, setAccountType] = useState<'student' | 'staff' | 'admin'>(
    'student'
  );
  const [isSubmitting, setIsSubmitting] = useState(false); // For disabling button during submission
  const [submitError, setSubmitError] = useState<string | null>(null); // For displaying submission errors

  const watchedFacultyId = watch('facultyId');
  const watchedRole = watch('role');
  const watchedDepartmentId = watch('departmentId');

  const { data: facultiesData, loading: facultiesLoading } = useFetch<{
    faculties: Faculty[];
  }>('/faculties'); // Fetch faculties for the select input
  const faculties = facultiesData?.faculties || [];

  const { data: departmentsData, loading: departmentsLoading } = useFetch<{
    departments: Department[];
  }>(
    watchedFacultyId ? `/departments?facultyId=${watchedFacultyId}` : null // Fetch departments only if facultyId is selected
  );
  const departments = departmentsData?.departments || [];

  useEffect(() => {
    // Update accountType based on the selected role
    // This simplifies logic if an Admin doesn't get a student/staff ID
    // If an Admin *can* be a student or staff, then the radio buttons are more critical.
    if (watchedRole === 'Student') {
      setAccountType('student');
    } else if (watchedRole === 'Staff') {
      setAccountType('staff');
    } else if (watchedRole === 'Admin') {
      setAccountType('admin'); // Admins might not have a student/staff ID
    }
    // Reset department if role changes to Admin or if faculty changes
    if (watchedRole === 'Admin') {
      setValue('departmentId', null);
      setValue('facultyId', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedRole]);

  useEffect(() => {
    setValue(
      'departmentId',
      user?.staff?.departmentId || user?.student?.departmentId || null
    ); // Reset department when faculty changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedFacultyId]);

  const navigate = useNavigate();

  const yearEnumValues = baseUserSchema.shape.yearLevel._def.values;
  const yearLevelOptions = yearEnumValues.map((yearValue, index) => ({
    value: yearValue,
    label: `${getOrdinal(index + 1)} Year`,
  }));

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Construct the payload to send to the backend
    // Include studentId or staffId based on the accountType and fetched nextAvailableIds
    const submissionData: Partial<
      UserFormData & {
        studentId?: number;
        staffId?: number;
        position?: string;
        departmentId?: number | null;
      }
    > = {
      email: data.email,
      password: data.password,
      role: data.role,
    };

    if (data.role === 'Student' || data.role === 'Staff') {
      submissionData.firstName = data.firstName;
      submissionData.lastName = data.lastName;
      submissionData.departmentId = data.departmentId
        ? Number(data.departmentId)
        : null;
    }

    if (data.role === 'Staff') {
      submissionData.position = data.position;
    }

    if (data.role === 'Student') {
      submissionData.yearLevel = data.yearLevel;
    }

    console.log('Submitting user:', submissionData);

    if (user) {
      // If editing an existing user, include the user ID in the payload
      try {
        await api.put(`/users/${user.id}`, submissionData);
        toast.success('User updated successfully');
        navigate('/admin/users'); // Redirect to the users list page after successful update
      } catch (error: any) {
        console.error('Submission error:', error);
        toast.error(
          error.response?.data?.message || 'An unexpected error occurred'
        );
        setSubmitError(error.message || 'An unexpected error occurred.');
        // Display error toast/message
        setIsSubmitting(false);
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        await api.post('/users', submissionData);
        toast.success('User created successful');

        navigate('/admin/users'); // Redirect to the users list page after successful creation
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
    }
  };

  if (facultiesLoading) return <Spinner />;

  return (
    <div className="container mx-auto p-4 mt-7 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {user ? 'Edit User' : 'Add New User'}
      </h1>
      {/* @ts-ignore */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Grid for Email, Password, and Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.password
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            {' '}
            {/* Role spans full width on medium screens */}
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Role
            </label>
            <Select
              id="role"
              {...register('role')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.role
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
              options={[
                { value: 'Student', label: 'Student' },
                { value: 'Staff', label: 'Staff' },
                { value: 'Admin', label: 'Admin' },
              ]}
            />
            {errors.role && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.role.message}
              </p>
            )}
          </div>
        </div>

        {/* Conditional First Name and Last Name fields */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            watchedRole === 'Student' || watchedRole === 'Staff'
              ? 'max-h-96 opacity-100' // max-h should be enough for one row of fields
              : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!(watchedRole === 'Student' || watchedRole === 'Staff')}
        >
          {(watchedRole === 'Student' || watchedRole === 'Staff') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {/* pt-6 to add space from the Role field when these appear */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.firstName
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
                />
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.lastName
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
                />
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          )}
          {watchedRole === 'Student' && (
            <div className="mt-2">
              <Select
                options={yearLevelOptions}
                value={
                  yearLevelOptions.find(
                    (opt) => opt.value === watch('yearLevel')
                  )?.value
                }
                label="Year Level"
                {...register('yearLevel')}
                className="w-full"
              />
              {errors.yearLevel && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.yearLevel.message}
                </p>
              )}
            </div>
          )}
          {watchedRole === 'Staff' && (
            <div className="pt-6">
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Position
              </label>
              <Select
                id="position"
                {...register('position')}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.position ? 'border-red-500' : ''
                }`}
                options={[
                  { value: 'lecturer', label: 'Lecturer' },
                  { value: 'doctor', label: 'Doctor' },
                  { value: 'assistant', label: 'Assistant' },
                  { value: 'professor', label: 'Professor' },
                ]}
              />
            </div>
          )}
          {(watchedRole === 'Student' || watchedRole === 'Staff') && (
            <>
              <div className="pt-6">
                <label
                  htmlFor="facultyId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Faculty
                </label>
                <Select
                  defaultValue={Number(user?.facultyId) || ''}
                  id="facultyId"
                  {...register('facultyId')}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.facultyId
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
                  options={[
                    { value: '', label: 'Select Faculty' },
                    ...(faculties?.map((fac: Faculty) => ({
                      value: fac.id,
                      label: fac.name,
                    })) || []),
                  ]}
                  disabled={facultiesLoading}
                />
                {errors.facultyId && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.facultyId.message}
                  </p>
                )}
              </div>
              {!departmentsLoading && (
                <div className="pt-6">
                  <label
                    htmlFor="departmentId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Department
                  </label>
                  <Select
                    value={watchedDepartmentId || ''}
                    id="departmentId"
                    {...register('departmentId')}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.departmentId
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
                    options={[
                      { value: '', label: 'Select Department' },
                      ...(departments?.map((dept: Department) => ({
                        value: dept.id,
                        label: dept.name,
                      })) || []),
                    ]}
                    disabled={!watchedFacultyId}
                  />
                  {errors.departmentId && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.departmentId.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {!user && (
          <div>
            {accountType === 'student' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Next available Student ID will be automatically assigned upon
                  creation
                </p>
              </div>
            )}

            {accountType === 'staff' && (
              <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Next available Staff ID This will be automatically assigned
                  upon creation
                </p>
              </div>
            )}

            {accountType === 'admin' && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Admin accounts do not have an automatically assigned
                  Student/Staff ID.
                </p>
              </div>
            )}
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
            {user ? 'Updat' : 'Creat'}
            {isSubmitting
              ? 'ing...'
              : `e ${
                  watchedRole === 'Student'
                    ? 'Student'
                    : watchedRole === 'Staff'
                    ? 'Staff'
                    : 'Admin'
                } Account`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
