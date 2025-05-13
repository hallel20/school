import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '@/hooks/useFetch';
import { User } from '@/types';
import { getUserName } from '@/utils';
import { useState, useMemo, useEffect } from 'react'; // Added useMemo and useEffect
import Pagination from '@/components/ui/pagination';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import api from '@/services/api';
import Input from '@/components/ui/Input'; // Added Input
import useDebounce from '@/hooks/useDebounce'; // Added useDebounce

interface UsersResponse {
  users: User[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
}

const UsersList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination and filter state from URL
  const page = searchParams.get('page') || '1';
  const pageNumber = parseInt(page, 10);
  const pageSizeParam = searchParams.get('pageSize') || '10';
  const pageSizeNumber = parseInt(pageSizeParam, 10);
  const [pageSize, setPageSize] = useState(pageSizeNumber);
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Construct API URL
  const usersApiUrl = useMemo(() => {
    let url = `/users?page=${pageNumber}&pageSize=${pageSizeNumber}`;
    if (roleFilter) {
      url += `&role=${roleFilter}`;
    }
    if (debouncedSearchTerm) {
      url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
    }
    return url;
  }, [pageNumber, pageSizeNumber, roleFilter, debouncedSearchTerm]);

  const {
    data: usersData,
    loading: isLoading,
    refetch,
  } = useFetch<UsersResponse>(usersApiUrl);

  const { openDeleteConfirmation, DeleteModal } = useDeleteConfirmation();

  const { users, totalPages } = usersData || {
    users: [],
    totalPages: 0,
  };

  // Update URL search params when filters or pagination change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    params.set('pageSize', pageSize.toString());
    if (roleFilter) params.set('role', roleFilter);
    else params.delete('role');
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    else params.delete('search');
    setSearchParams(params, { replace: true });
  }, [pageNumber, pageSize, roleFilter, debouncedSearchTerm, setSearchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to page 1
    params.set('pageSize', size.toString());
    setSearchParams(params);
  };
  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to page 1
    setSearchParams(params);
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Effect to reset to page 1 when debounced search term or role filter changes
  useEffect(() => {
    if (debouncedSearchTerm || roleFilter) {
      // Only if a filter is active or search term exists
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, roleFilter, setSearchParams]); // Removed searchParams to avoid loop

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

      <Card>
        <div className="flex flex-col md:flex-row items-end pb-4">
          <div className="w-full">
            <Input
              id="user-search"
              label="Search Users"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-full">
            <Select
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              options={[
                { label: 'All Roles', value: '' },
                { label: 'Admin', value: 'Admin' },
                { label: 'Staff', value: 'Staff' },
                { label: 'Student', value: 'Student' },
              ]}
            />
          </div>
          <div className="w-full md:ml-auto md:w-auto lg:col-start-3">
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
        </div>
        <Table
          columns={columns}
          data={users} // Data is now pre-filtered and paginated by the server
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
  );
};

export default UsersList;
