import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '@/hooks/useFetch';
import { Course, Department, Faculty } from '@/types';
import Pagination from '@/components/ui/pagination';
import { useState, useEffect, useMemo } from 'react';
import ViewCourse from '@/components/modals/ViewCourse';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import api from '@/services/api';
import Input from '@/components/ui/Input'; // Import Input component
import Select from '@/components/ui/Select'; // Ensure Select is imported if still used for Page Size
import CustomSelect, { Option } from '@/components/ui/ReSelect'; // Assuming Option is exported or defined in ReSelect
import useDebounce from '@/hooks/useDebounce'; // Import the useDebounce hook
import { camelCaseToSentence, capitalizeFirstLetter } from '@/utils';

interface CourseResponse {
  courses: Course[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCourses: number;
}

interface FacultyResponse {
  faculties: Faculty[];
}

interface DepartmentResponse {
  departments: Department[];
}

const CoursesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination state
  const page = searchParams.get('page') || '1';
  const pageNumber = parseInt(page, 10);
  const pageSizeParam = searchParams.get('pageSize') || '10';
  const pageSizeNumber = parseInt(pageSizeParam, 10);
  const [pageSize, setPageSize] = useState(pageSizeNumber);

  // Modal state
  const [course, setCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  // Filter state
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(
    searchParams.get('facultyId')
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(searchParams.get('departmentId'));
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get('search') || ''
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search term by 500ms

  // Data fetching for filters
  const { data: facultyData, loading: facultiesLoading } =
    useFetch<FacultyResponse>('/faculties');
  const [departmentsForFaculty, setDepartmentsForFaculty] = useState<
    Department[]
  >([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  // Construct courses API URL based on filters and pagination
  const coursesApiUrl = useMemo(() => {
    let url = `/courses?page=${pageNumber}&pageSize=${pageSizeNumber}`;
    if (selectedFacultyId) {
      url += `&facultyId=${selectedFacultyId}`;
    }
    if (selectedDepartmentId) {
      url += `&departmentId=${selectedDepartmentId}`;
    }
    if (debouncedSearchTerm) {
      // Use debounced search term for API call
      url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
    }
    return url;
  }, [
    pageNumber,
    pageSizeNumber,
    selectedFacultyId,
    selectedDepartmentId,
    debouncedSearchTerm,
  ]);

  const {
    data: { courses, totalPages } = {
      courses: [],
      totalPages: 0,
    },
    loading: isLoading,
    refetch,
  } = useFetch<CourseResponse>(coursesApiUrl);

  const { openDeleteConfirmation, DeleteModal } = useDeleteConfirmation();

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    params.set('pageSize', pageSize.toString());
    if (selectedFacultyId) params.set('facultyId', selectedFacultyId);
    if (selectedDepartmentId) params.set('departmentId', selectedDepartmentId);
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    else params.delete('search'); // Use debounced search term for URL
    setSearchParams(params, { replace: true });
  }, [
    pageNumber,
    pageSize,
    selectedFacultyId,
    selectedDepartmentId,
    setSearchParams, // Keep setSearchParams here
    debouncedSearchTerm, // Depend on debouncedSearchTerm for URL update
  ]);

  // Fetch departments when faculty changes
  useEffect(() => {
    if (selectedFacultyId) {
      setDepartmentsLoading(true);
      api
        .get<DepartmentResponse>(
          `/departments?facultyId=${selectedFacultyId}&pageSize=1000`
        ) // Fetch all for selected faculty
        .then((response) => {
          setDepartmentsForFaculty(response.data.departments || []);
        })
        .catch(() => {
          toast.error('Failed to load departments for the selected faculty.');
          setDepartmentsForFaculty([]);
        })
        .finally(() => setDepartmentsLoading(false));
    } else {
      setDepartmentsForFaculty([]);
      setSelectedDepartmentId(null); // Clear department if faculty is cleared
    }
  }, [selectedFacultyId]);

  const facultyOptions: Option[] =
    facultyData?.faculties.map((fac) => ({
      value: fac.id.toString(),
      label: fac.name,
    })) || [];

  const departmentOptions: Option[] = departmentsForFaculty.map((dept) => ({
    value: dept.id.toString(),
    label: dept.name,
  }));

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // No need to update searchParams here directly, useEffect for debouncedSearchTerm will handle it.
    // However, if you want to reset to page 1 immediately when typing starts, you can do it here,
    // but it might feel a bit aggressive. Resetting on debounced change is usually preferred.
    // For now, let's let the main useEffect handle page reset based on debouncedSearchTerm.
  };

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Course Name', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
    {
      header: 'Lecturer',
      accessor: (course: Course) =>
        course.lecturer?.firstName + ' ' + course.lecturer?.lastName,
    },
    {
      header: 'Deparment',
      accessor: (course: Course) => (
        <Link to={`/admin/departments/${course.department?.id}`}>
          {course.department?.name}
        </Link>
      ),
    },
    {
      header: 'Semester',
      accessor: (course: Course) => camelCaseToSentence(course.semester),
    },
    {
      header: 'Year',
      accessor: (course: Course) => capitalizeFirstLetter(course.yearLevel),
    },
    {
      header: 'Actions',
      accessor: (course: Course) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              handleViewCourse(course);
            }}
          >
            <Eye size={16} />
          </button>
          <button
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/courses/edit/${course.id}`);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirmation({
                title: 'Delete Course',
                message: `Are you sure you want to delete course ${course.code}?`,
                onConfirm: async () => {
                  await toast.promise(api.delete(`/courses/${course.id}`), {
                    loading: 'Deleting...',
                    success: `Deleted course ${course.name}`,
                    error: `Failed to delete user ${course.name}`,
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

  const handleViewCourse = (course: Course) => {
    setCourse(course);
    setOpen(true);
  };

  const handleFacultyChange = (option: Option | null) => {
    setSelectedFacultyId(option ? option.value : null);
    setSelectedDepartmentId(null); // Reset department when faculty changes
    // URL will be updated by useEffect
  };

  const handleDepartmentChange = (option: Option | null) => {
    setSelectedDepartmentId(option ? option.value : null);
    // URL will be updated by useEffect
  };
  const clearFilters = () => {
    setSelectedFacultyId(null);
    setSelectedDepartmentId(null);
    setSearchTerm(''); // Clear search term as well
    // The debouncedSearchTerm will update, and the useEffect will clear the URL param
  };

  // Effect to reset to page 1 when debounced search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams, debouncedSearchTerm]);
  return (
    <>
      <div className="px-4 py-6">
        <PageHeader
          title="Course Management"
          subtitle="View and manage all courses"
          actions={
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/admin/courses/add')}
            >
              Add Course
            </Button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end pb-4">
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
                facultyOptions.find((opt) => opt.value === selectedFacultyId) ||
                null
              }
              onChange={handleFacultyChange}
              isLoading={facultiesLoading}
              isClearable
              placeholder="Select Faculty..."
            />
          </div>
          <div>
            <label
              htmlFor="department-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Department
            </label>
            <CustomSelect
              inputId="department-filter"
              options={departmentOptions}
              value={
                departmentOptions.find(
                  (opt) => opt.value === selectedDepartmentId
                ) || null
              }
              onChange={handleDepartmentChange}
              isLoading={departmentsLoading}
              isDisabled={!selectedFacultyId || departmentsLoading}
              isClearable
              placeholder="Select Department..."
            />
          </div>
          <div className="lg:col-start-4 flex items-end">
            {' '}
            {/* Aligns page size to the right on larger screens */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full md:w-auto mb-1 md:mb-0 mr-2"
            >
              Clear Filters
            </Button>
          </div>
        </div>
        <Card>
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-4">
            <div className="w-full md:w-1/3">
              <Input
                id="course-search"
                label="Search Courses"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="w-full md:w-auto">
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
            data={courses}
            keyField="id"
            isLoading={isLoading}
            onRowClick={(course) => handleViewCourse(course as Course)}
          />
        </Card>
        <Pagination
          totalPages={totalPages}
          currentPage={Number(page)}
          onPageChange={handlePageChange}
        />
      </div>
      {open && course && (
        <ViewCourse
          course={course}
          onClose={() => setOpen(false)}
          open={open}
        />
      )}
      <DeleteModal />
    </>
  );
};

export default CoursesList;
