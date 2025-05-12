import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '@/hooks/useFetch';
import { Faculty } from '@/types';
import Pagination from '@/components/ui/pagination';
import { useState } from 'react';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import api from '@/services/api';
import Select from '@/components/ui/Select';

interface FacultyResponse {
  faculties: Faculty[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalfaculties: number;
}

export default function FacultyList() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const page = searchParams[0].get('page') || '1';
  const pageNumber = parseInt(page, 10);
  const pageSizeParam = searchParams[0].get('pageSize') || '10';
  const pageSizeNumber = parseInt(pageSizeParam, 10);
  const [pageSize, setPageSize] = useState(pageSizeNumber);
  const {
    data: { faculties, totalPages } = {
      faculties: [],
      totalPages: 0,
    },
    loading: isLoading,
    refetch,
  } = useFetch<FacultyResponse>(
    `/faculties?page=${pageNumber}&pageSize=${pageSizeNumber}`
  ); // Custom hook to fetch faculties
  const { openDeleteConfirmation, DeleteModal } = useDeleteConfirmation();

  const handlePageChange = (page: number) => {
    navigate(`/admin/faculties?page=${page}&pageSize=${pageSize}`);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    navigate(`/admin/faculties?page=${page}&pageSize=${size}`);
  };

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Faculty Name', accessor: 'name' },
    {
      header: 'Dean',
      accessor: (department: Faculty) =>
        department.dean?.firstName ||
        'Not' + ' ' + department.dean?.lastName ||
        'Selected',
    },
    {
      header: 'Actions',
      accessor: (department: Faculty) => (
        <div className="flex space-x-2">
          <Link
            to={`/admin/faculties/${department.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Eye size={16} />
          </Link>
          <button
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/faculties/edit/${department.id}`);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirmation({
                title: 'Delete Faculty',
                message: `Are you sure you want to delete department ${department.code}?`,
                onConfirm: async () => {
                  await toast.promise(
                    api.delete(`/faculties/${department.id}`),
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

  return (
    <>
      <div className="px-4 py-6">
        <PageHeader
          title="Faculty Management"
          subtitle="View and manage all faculties"
          actions={
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/admin/faculties/add')}
            >
              Add Faculty
            </Button>
          }
        />
        <div className="flex justify-end items-center gap-2 pb-3">
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
            data={faculties}
            keyField="id"
            isLoading={isLoading}
            onRowClick={(department) =>
              navigate('/admin/faculties/' + department.id)
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
