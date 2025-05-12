import { Staff } from '@/types'; // Assuming Staff type is defined in @/types
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

interface StaffListModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff[];
  departmentName: string;
}

const StaffListModal: React.FC<StaffListModalProps> = ({
  isOpen,
  onClose,
  staff,
  departmentName,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose} // Close modal on overlay click
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Staff in {departmentName}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>

        {staff.length > 0 ? (
          <ul className="space-y-3">
            {staff.map((staffMember) => (
              <li
                key={staffMember.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {staffMember.firstName} {staffMember.lastName}
                </p>
                {staffMember.user?.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {staffMember.user?.email}
                  </p>
                )}
                {staffMember.position && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Role: {staffMember.position}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            No staff members found for this department.
          </p>
        )}

        <div className="mt-6 text-right">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffListModal;
