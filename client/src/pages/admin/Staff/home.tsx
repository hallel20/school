import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '@/hooks/useFetch';
import { Staff } from '@/types';
import { useState, useMemo, useEffect } from 'react'; // Added useMemo and useEffect
import Pagination from '@/components/ui/pagination';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import api from '@/services/api';
import Input from '@/components/ui/Input'; // Added Input
import useDebounce from '@/hooks/useDebounce'; // Added useDebounce

interface StaffResponse {
  staff: Staff[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalStaff: number;
}

const StaffList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination and filter state from URL
  const page = searchParams.get('page') || '1';
  const pageNumber = parseInt(page, 10);
  const pageSizeParam = searchParams.get('pageSize') || '10';
  const pageSizeNumber = parseInt(pageSizeParam, 10);
  const [pageSize, setPageSize] = useState(pageSizeNumber);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Construct API URL
  const staffApiUrl = useMemo(() => {
    let url = `/staff?page=${pageNumber}&pageSize=${pageSizeNumber}`;
    if (debouncedSearchTerm) {
      url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
    }
    return url;
  }, [pageNumber, pageSizeNumber, debouncedSearchTerm]);

  const {
    data: staffData,
    loading: isLoading,
    refetch,
  } = useFetch<StaffResponse>(staffApiUrl);

  const { openDeleteConfirmation, DeleteModal } = useDeleteConfirmation();

  const { staff, totalPages } = staffData || {
    staff: [],
    totalPages: 0,
  };

  // Update URL search params when filters or pagination change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    params.set('pageSize', pageSize.toString());
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    else params.delete('search');
    setSearchParams(params, { replace: true });
  }, [pageNumber, pageSize, debouncedSearchTerm, setSearchParams]);

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

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Full Name',
      accessor: (staff: Staff) => staff.firstName + ' ' + staff.lastName,
    },
    { header: 'Email', accessor: (staff: Staff) => staff.user?.email },
    { header: 'Position', accessor: 'position' },
    { header: "Department", accessor: (staff: Staff) => staff.department?.name },
    {
      header: 'Actions',
      accessor: (staff: Staff) => (
        <div className="flex space-x-2">
          {/* <button
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/staff/view/${staff.id}`);
            }}
          >
            <Eye size={16} />
          </button> */}
          <button
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/staff/edit/${staff.id}`);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirmation({
                title: 'Delete Staff',
                message: `Are you sure you want to delete staff ${staff.user?.email}?`,
                onConfirm: async () => {
                  await toast.promise(api.delete(`/staff/${staff.id}`), {
                    loading: 'Deleting...',
                    success: `Deleted staff ${staff.user?.email}`,
                    error: `Failed to delete staff ${staff.user?.email}`,
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
    if (debouncedSearchTerm) {
      // Only if a filter is active or search term exists
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, setSearchParams]); // Removed searchParams to avoid loop

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Staff Management"
        subtitle="View and manage all staff"
        actions={
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => navigate('/admin/staff/add')}
          >
            Add Staff
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col md:flex-row items-end pb-4">
          <div className="w-full">
            <Input
              id="staff-search"
              label="Search Staff"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={handleSearchChange}
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
          data={staff} // Data is now pre-filtered and paginated by the server
          keyField="id"
          isLoading={isLoading}
          onRowClick={(staff) => navigate(`/admin/staff/view/${staff.id}`)}
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

export default StaffList;
