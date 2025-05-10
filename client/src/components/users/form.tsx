import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { User } from '../../types';

// Define the Zod schema for user fields
const baseUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['Student', 'Staff', 'Admin'], {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // studentId and staffId are not part of the form input directly if auto-assigned
  // They will be added to the payload before sending to the backend if needed
});

// Refine schema to make firstName and lastName required for Student and Staff
const UserFormSchema = baseUserSchema.superRefine((data, ctx) => {
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
});

type UserFormData = z.infer<typeof UserFormSchema>;

interface UserFormProps {
  user?: User; // Optional user prop for editing
}

const UserForm: React.FC<UserFormProps> = ({ user }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch, // To watch changes in form values if needed
  } = useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      email: user?.email || '',
      password: user?.password || '',
      role: user?.role || 'Student', // Default role
      firstName: user?.staff?.firstName || user?.student?.firstName || '',
      lastName: user?.staff?.lastName || user?.student?.lastName || '',
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

  // Watch the role field to potentially update accountType
  const watchedRole = watch('role');

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
  }, [watchedRole]);

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Construct the payload to send to the backend
    // Include studentId or staffId based on the accountType and fetched nextAvailableIds
    const submissionData: Partial<
      UserFormData & { studentId?: number; staffId?: number }
    > = {
      email: data.email,
      password: data.password,
      role: data.role,
    };

    if (data.role === 'Student' || data.role === 'Staff') {
      submissionData.firstName = data.firstName;
      submissionData.lastName = data.lastName;
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

  return (
    <div className="container mx-auto p-4 mt-7 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Add New User
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Role
          </label>
          <select
            id="role"
            {...register('role')}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.role
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
          >
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Conditional First Name and Last Name fields */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            watchedRole === 'Student' || watchedRole === 'Staff'
              ? 'max-h-96 opacity-100' // Adjust max-h if more space is needed (e.g., max-h-[20rem] or more)
              : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!(watchedRole === 'Student' || watchedRole === 'Staff')}
        >
          {/* This inner div ensures that when visible, its children have spacing */}
          {(watchedRole === 'Student' || watchedRole === 'Staff') && (
            <div className="space-y-6 pt-6">
              {' '}
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
        </div>

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
              Next available Staff ID This will be automatically assigned upon
              creation
            </p>
          </div>
        )}

        {accountType === 'admin' && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Admin accounts do not have an automatically assigned Student/Staff
              ID.
            </p>
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
