import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Department } from '@/types';
import Button from '../ui/Button';
import StaffListModal from '../modals/StaffListModal';

interface DepartmentDetailsProps {
  department: Department;
}

export const DepartmentDetails: React.FC<DepartmentDetailsProps> = ({
  department,
}) => {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</p>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{department.code}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{department.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Head of Department</p>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {department.hod
              ? `${department.hod.firstName} ${department.hod.lastName}`
              : 'N/A'
            }
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Faculty</p>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {department.faculty ? department.faculty.name : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Courses</p>
          <div className="mt-1 text-sm">
            {department.courses && department.courses.length > 0 ? (
              <Link
                to={`/admin/departments/${department.id}/courses`}
                className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                View {department.courses.length} course(s)
              </Link>
            ) : (
              <p className="text-gray-900 dark:text-gray-100">No courses assigned</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Students</p>
          <div className="mt-1 text-sm">
            {department.students && department.students.length > 0 ? (
              <Link
                to={`/admin/departments/${department.id}/students`}
                className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                View {department.students.length} student(s)
              </Link>
            ) : (
              <p className="text-gray-900 dark:text-gray-100">No students enrolled</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Staff</p>
          <div className="mt-1 text-sm">
            {department.staff && department.staff.length > 0 ? (
              <Button
                onClick={() => setIsStaffModalOpen(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline dark:hover:text-blue-300 px-0 py-0" // Added explicit link styling as a fallback
              >
                View {department.staff.length} staff member(s)
              </Button>
            ) : (
              <p className="text-gray-900 dark:text-gray-100">No staff assigned</p>
            )}
          </div>
        </div>
      </div>
      {isStaffModalOpen && department.staff && (
        <StaffListModal
          isOpen={isStaffModalOpen} 
          onClose={() => setIsStaffModalOpen(false)} 
          staff={department.staff} 
          departmentName={department.name} 
        />
      )}
    </div>
  );
};
