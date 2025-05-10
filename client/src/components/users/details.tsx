import { User } from '../../types';

export default function UserDetails({ user }: { user: User }) {
  return (
    <div className="shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">User Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-200">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          {user.role === 'Admin' && (
            <p className="text-gray-200">
              <span className="font-medium">Role:</span> {user.role}
            </p>
          )}
        </div>
        {user.role !== 'Admin' && (
          <div>
            <p className="text-gray-200">
              <span className="font-medium">Name:</span>{' '}
              {user.staff?.firstName || user.student?.firstName}{' '}
              {user.staff?.lastName || user.student?.lastName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
