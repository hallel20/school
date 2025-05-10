import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../../hooks/useFetch';
import { User } from '../../../types';
import { getUserName } from '../../../utils';
import { useState } from 'react';
import Pagination from '../../../components/ui/pagination';
import { useDeleteConfirmation } from '../../../hooks/useDeleteConfirmation';
import api from '../../../services/api';

interface UsersResponse {
  users: User[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
}

const UsersList = () => {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const page = searchParams[0].get('page') || '1';
  const pageNumber = parseInt(page, 10);
  const pageSizeParam = searchParams[0].get('pageSize') || '10';
  const pageSizeNumber = parseInt(pageSizeParam, 10);

  const [roleFilter, setRoleFilter] = useState('');
  const [pageSize, setPageSize] = useState(pageSizeNumber);

  const {
    data,
    loading: isLoading,
    refetch,
  } = useFetch<UsersResponse>(
    `/users?role=${roleFilter}&page=${pageNumber}&pageSize=${pageSizeNumber}`
  );

  const { openDeleteConfirmation, DeleteModal } = useDeleteConfirmation();

  const { users, totalPages } = data || {
    users: [],
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalUsers: 0,
  };

  const handlePageChange = (page: number) => {
    navigate(
      `/admin/users?role=${roleFilter}&page=${page}&pageSize=${pageSize}`
    );
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    navigate(`/admin/users?role=${roleFilter}&page=${page}&pageSize=${size}`);
  };
  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    navigate(`/admin/users?role=${role}&page=${page}&pageSize=${pageSize}`);
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'First Name',
      accessor: (user: User) => getUserName(user, 'firstName'),
    },
    {
      header: 'Last Name',
      accessor: (user: User) => getUserName(user, 'lastName'),
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/users/view/${user.id}`);
            }}
          >
            <Eye size={16} />
          </button>
          <button
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/users/edit/${user.id}`);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirmation({
                title: 'Delete User',
                message: `Are you sure you want to delete user ${user?.email}?`,
                onConfirm: async () => {
                  await toast.promise(api.delete(`/users/${user.id}`), {
                    loading: 'Deleting...',
                    success: `Deleted user ${user.email}`,
                    error: `Failed to delete user ${user.email}`,
                  });
                  refetch();
                },
              });
            }}
          >
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="User Management"
        subtitle="View and manage all users"
        actions={
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => navigate('/admin/users/add')}
          >
            Add User
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex justify-end items-center gap-2">
          <Select
            label="Role"
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            options={[
              { label: 'All', value: '' },
              { label: 'Admin', value: 'Admin' },
              { label: 'Staff', value: 'Staff' },
              { label: 'Student', value: 'Student' },
            ]}
          />
          <Select
            label="Page Size"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            options={[
              { label: '5', value: 5 },
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '50', value: 50 },
              { label: '100', value: 100 },
            ]}
          />
        </div>
        <Card>
          <Table
            columns={columns}
            data={users
              ?.filter((user) => (roleFilter ? user.role === roleFilter : true))
              .slice(0, pageSize)}
            keyField="id"
            isLoading={isLoading}
            onRowClick={(user) => navigate(`/admin/users/view/${user.id}`)}
          />
          <Pagination
            onPageChange={handlePageChange}
            currentPage={pageNumber}
            totalPages={totalPages}
          />
        </Card>
        <DeleteModal />
      </div>
    </div>
  );
};

export default UsersList;
