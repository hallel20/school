import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '@/hooks/useFetch';
import { Department, Faculty } from '@/types'; // Added Faculty
import Pagination from '@/components/ui/pagination';
import { useState, useEffect, useMemo } from 'react'; // Added useEffect and useMemo
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import api from '@/services/api';
import Select from '@/components/ui/Select';
import CustomSelect, { Option } from '@/components/ui/ReSelect'; // Added CustomSelect and Option

interface DepartmentResponse {
  departments: Department[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalDepartments: number;
}

interface FacultyResponse {
  faculties: Faculty[];
}

export default function DepartmentList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination state
  const page = searchParams.get('page') || '1';
  const pageNumber = parseInt(page, 10);
  const pageSizeParam = searchParams.get('pageSize') || '10';
  const pageSizeNumber = parseInt(pageSizeParam, 10);
  const [pageSize, setPageSize] = useState(pageSizeNumber);

  // Filter state
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(
    searchParams.get('facultyId')
  );

  // Data fetching for faculty filter
  const { data: facultyData, loading: facultiesLoading } =
    useFetch<FacultyResponse>('/faculties');

  // Construct departments API URL based on filters and pagination
  const departmentsApiUrl = useMemo(() => {
    let url = `/departments?page=${pageNumber}&pageSize=${pageSizeNumber}`;
    if (selectedFacultyId) {
      url += `&facultyId=${selectedFacultyId}`;
    }
    return url;
  }, [pageNumber, pageSizeNumber, selectedFacultyId]);

  const {
    data: { departments, totalPages } = {
      departments: [],
      totalPages: 0,
    },
    loading: isLoading,
    refetch,
  } = useFetch<DepartmentResponse>(departmentsApiUrl);
  const { openDeleteConfirmation, DeleteModal } = useDeleteConfirmation();

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    params.set('pageSize', pageSize.toString());
    if (selectedFacultyId) params.set('facultyId', selectedFacultyId);
    else params.delete('facultyId');

    setSearchParams(params, { replace: true });
  }, [pageNumber, pageSize, selectedFacultyId, setSearchParams]);

  const facultyOptions: Option[] =
    facultyData?.faculties.map((fac) => ({
      value: fac.id.toString(),
      label: fac.name,
    })) || [];

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to page 1 when page size changes
    params.set('pageSize', size.toString());
    setSearchParams(params);
  };

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Department Name', accessor: 'name' },
    {
      header: 'HOD',
      accessor: (department: Department) =>
        department.hod?.firstName && department.hod?.lastName
          ? `${department.hod.firstName} ${department.hod.lastName}`
          : 'Not Assigned',
    },
    {
      header: 'Actions',
      accessor: (department: Department) => (
        <div className="flex space-x-2">
          <Link
            to={`/admin/departments/${department.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Eye size={16} />
          </Link>
          <button
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/departments/edit/${department.id}`);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirmation({
                title: 'Delete Department',
                message: `Are you sure you want to delete department ${department.code}?`,
                onConfirm: async () => {
                  await toast.promise(
                    api.delete(`/departments/${department.id}`),
                    {
                      loading: 'Deleting...',
                      success: `Deleted department ${department.name}`,
                      error: `Failed to delete user ${department.name}`,
                    }
                  );
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

  const handleFacultyChange = (option: Option | null) => {
    setSelectedFacultyId(option ? option.value : null);
    // URL will be updated by useEffect, which will also reset page to 1
  };

  const clearFilters = () => {
    setSelectedFacultyId(null);
  };

  return (
    <>
      <div className="px-4 py-6">
        <PageHeader
          title="Department Management"
          subtitle="View and manage all departments"
          actions={
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/admin/departments/add')}
            >
              Add Department
            </Button>
          }
        />
        <div className="flex justify-between items-end gap-4 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-4">
            <div>
              <label
                htmlFor="faculty-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Filter by Faculty
              </label>
              <CustomSelect
                inputId="faculty-filter"
                options={facultyOptions}
                value={
                  facultyOptions.find(
                    (opt) => opt.value === selectedFacultyId
                  ) || null
                }
                onChange={handleFacultyChange}
                isLoading={facultiesLoading}
                isClearable
                placeholder="Select Faculty..."
              />
            </div>
            <div className="lg:col-start-3 flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full md:w-auto mb-1 md:mb-0 mr-2"
              >
                Clear Filter
              </Button>
            </div>
          </div>
          <div className="flex items-end justify-end">
            {' '}
            {/* Aligns page size to the right on larger screens */}
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
        <Card>
          <Table
            columns={columns}
            data={departments}
            keyField="id"
            isLoading={isLoading}
            onRowClick={(department) =>
              navigate('/admin/departments/' + department.id)
            }
          />
        </Card>
        <Pagination
          totalPages={totalPages}
          currentPage={Number(page)}
          onPageChange={handlePageChange}
        />
      </div>
      <DeleteModal />
    </>
  );
}
