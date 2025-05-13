import React, { useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';

import { AcademicSession, Semester } from '../../types';
import api from '../../services/api'; 

import Input from '../ui/Input';
import Button from '../ui/Button';

// Zod Schemas (can be imported from a separate file)
const semesterSchema = z.object({
  id: z.number().optional(), // For potential edit scenarios
  name: z.string().min(3, 'Semester name must be at least 3 characters'),
});

const academicSessionSchema = z.object({
  id: z.number().optional(), // For edit mode
  name: z
    .string()
    .min(3, 'Academic session name must be at least 3 characters'),
  semesters: z
    .array(semesterSchema)
    .min(1, 'At least one semester is required.'),
});

type AcademicSessionFormData = z.infer<typeof academicSessionSchema>;

interface AcademicSessionFormProps {
  academicSession?: AcademicSession & { semesters: Semester[] }; // For editing
  onSuccess?: (data: AcademicSession) => void;
  onCancel?: () => void;
}

const AcademicSessionForm: React.FC<AcademicSessionFormProps> = ({
  academicSession,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AcademicSessionFormData>({
    resolver: zodResolver(academicSessionSchema),
    defaultValues: {
      id: academicSession?.id,
      name: academicSession?.name || '',
      semesters: academicSession?.semesters?.length
        ? academicSession.semesters.map((s) => ({ id: s.id, name: s.name }))
        : [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'semesters',
  });

  useEffect(() => {
    if (academicSession) {
      reset({
        id: academicSession.id,
        name: academicSession.name,
        semesters: academicSession.semesters?.length
          ? academicSession.semesters.map((s) => ({ id: s.id, name: s.name }))
          : [{ name: '' }],
      });
    } else {
      reset({
        name: '',
        semesters: [{ name: '' }],
      });
    }
  }, [academicSession, reset]);

  const onSubmitHandler: SubmitHandler<AcademicSessionFormData> = async (
    data
  ) => {
    const payload = {
      name: data.name,
      // Filter out semesters with empty names if any were added but not filled
      // Also, ensure we only send 'name' for new semesters, and 'id'/'name' for existing ones if backend supports it
      semesters: data.semesters
        .filter((s) => s.name.trim() !== '')
        .map((s) => ({ ...(s.id && { id: s.id }), name: s.name })),
    };

    try {
      let response;
      if (academicSession?.id) {
        response = await api.put(
          `/academic/sessions/${academicSession.id}`,
          payload
        );
        toast.success('Academic Session updated successfully!');
      } else {
        response = await api.post('/academic/sessions', payload);
        toast.success('Academic Session created successfully!');
      }
      if (onSuccess) {
        onSuccess(response.data);
      } else {
        navigate('/admin/academic-sessions'); // Default navigation
      }
      reset();
    } catch (error: any) {
      console.error('Failed to save academic session:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to save academic session.'
      );
    }
  };

  return (
    <div className="container mx-auto p-4 mt-7 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {academicSession ? 'Edit Academic Session' : 'Create Academic Session'}
      </h1>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        <div>
          <label
            htmlFor="sessionName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Academic Session Name
          </label>
          <Input
            id="sessionName"
            type="text"
            {...register('name')}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.name
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
            placeholder="e.g., 2023/2024"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Semesters
          </h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start space-x-3 p-3 border dark:border-gray-700 rounded-md"
            >
              <div className="flex-grow">
                <label
                  htmlFor={`semester-name-${index}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Semester {index + 1} Name
                </label>
                <Input
                  id={`semester-name-${index}`}
                  type="text"
                  {...register(`semesters.${index}.name` as const)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.semesters?.[index]?.name
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
                  placeholder="e.g., First Semester"
                />
                {errors.semesters?.[index]?.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.semesters[index]?.name?.message}
                  </p>
                )}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 mt-7 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label={`Remove semester ${index + 1}`}
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          ))}
          {errors.semesters &&
            !errors.semesters.length &&
            typeof errors.semesters.message === 'string' && (
              <p className="text-sm text-red-600 mt-1">
                {errors.semesters.message}
              </p>
            )}

          <Button
            type="button"
            onClick={() => append({ name: '' })}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle size={18} />
            <span>Add Semester</span>
          </Button>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isSubmitting
              ? academicSession
                ? 'Updating...'
                : 'Creating...'
              : academicSession
              ? 'Update Session'
              : 'Create Session'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AcademicSessionForm;
