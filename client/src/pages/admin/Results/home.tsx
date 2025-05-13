import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  PlusCircle,
  Edit,
  Trash,
  Eye,
  Search as SearchIcon,
} from 'lucide-react'; // Added SearchIcon
import toast from 'react-hot-toast';
import useFetch from '@/hooks/useFetch';
import {
  Result,
  Student,
  AcademicSession,
  Semester,
} from '@/types'; // Added Student, AcademicSession, Semester
import Pagination from '@/components/ui/pagination';
import { useState, useEffect, useMemo } from 'react';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import api from '@/services/api';
import Input from '@/components/ui/Input'; // Import Input component
import Select from '@/components/ui/Select'; // Ensure Select is imported if still used for Page Size
import CustomSelect, { Option } from '@/components/ui/ReSelect'; // Assuming Option is exported or defined in ReSelect
import useDebounce from '@/hooks/useDebounce'; // Import the useDebounce hook

interface ResultResponse {
  results: Result[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalResult: number;
}

// Responses for new filters
interface StudentResponse {
  students: Student[];
  // Add pagination fields if your API supports it
}

const ResultList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination state
  const page = searchParams.get('page') || '1';
  const pageNumber = parseInt(page, 10);
  const pageSizeParam = searchParams.get('pageSize') || '10';
  const pageSizeNumber = parseInt(pageSizeParam, 10);
  const [pageSize, setPageSize] = useState(pageSizeNumber);

  // New Filter States (values from dropdowns, synced with URL)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    searchParams.get('studentId')
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    searchParams.get('sessionId')
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(
    searchParams.get('semesterId')
  );

  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get('search') || ''
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search term by 500ms

  // State to control fetching for a specific semester via button
  const [fetchSpecificSemesterTriggered, setFetchSpecificSemesterTriggered] =
    useState(false);

  // Data fetching for new dropdowns
  const { data: studentsData, loading: studentsLoading } =
    useFetch<StudentResponse>('/students?pageSize=1000'); // Fetch all students for dropdown
  const { data: academicSessionsData, loading: academicSessionsLoading } =
    useFetch<AcademicSession[]>('/academic/sessions');

  const [semestersForSession, setSemestersForSession] = useState<Semester[]>(
    []
  );
  const [semestersLoading, setSemestersLoading] = useState(false);

  // Construct results API URL
  const resultsApiUrl = useMemo(() => {
    const currentStudentId = searchParams.get('studentId');
    if (!currentStudentId) return null; // Don't fetch if no student is selected

    let url = `/admin/results?studentId=${currentStudentId}&page=${pageNumber}&pageSize=${pageSizeNumber}`;

    const currentSessionId = searchParams.get('sessionId');
    if (currentSessionId) {
      url += `&sessionId=${currentSessionId}`;

      const currentSemesterId = searchParams.get('semesterId');
      // Only add semesterId to the API call if it's selected AND the button has triggered its fetch
      if (currentSemesterId && fetchSpecificSemesterTriggered) {
        url += `&semesterId=${currentSemesterId}`;
      }
    }

    if (debouncedSearchTerm) {
      url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
    }
    return url;
  }, [
    pageNumber,
    pageSizeNumber,
    debouncedSearchTerm,
    searchParams, // important: re-evaluate when searchParams change
    fetchSpecificSemesterTriggered,
  ]);

  // Effect to reset fetchSpecificSemesterTriggered if selections change
  useEffect(() => {
    setFetchSpecificSemesterTriggered(false);
  }, [selectedStudentId, selectedSessionId, selectedSemesterId]);

  // Effect to set initial fetchSpecificSemesterTriggered state from URL
  useEffect(() => {
    if (
      searchParams.get('studentId') &&
      searchParams.get('sessionId') &&
      searchParams.get('semesterId')
    ) {
      // If all three are in the URL, assume it was a direct link or refresh after a button click
      setFetchSpecificSemesterTriggered(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const {
    data: { results, totalPages } = {
      results: [],
      totalPages: 0,
    },
    loading: isLoading,
    refetch: refetchResults,
  } = useFetch<ResultResponse>(resultsApiUrl);

  const { openDeleteConfirmation, DeleteModal } = useDeleteConfirmation();

  // Update URL search params when filter states change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    params.set('pageSize', pageSize.toString());

    if (selectedStudentId) params.set('studentId', selectedStudentId);
    else params.delete('studentId');

    if (selectedSessionId) params.set('sessionId', selectedSessionId);
    else params.delete('sessionId');

    if (selectedSemesterId) params.set('semesterId', selectedSemesterId);
    else params.delete('semesterId');

    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    else params.delete('search');

    setSearchParams(params, { replace: true });
  }, [
    pageNumber,
    pageSize,
    selectedStudentId,
    selectedSessionId,
    selectedSemesterId,
    debouncedSearchTerm,
    setSearchParams,
  ]);

  // Fetch semesters when academic session changes
  useEffect(() => {
    if (selectedSessionId) {
      setSemestersLoading(true);
      api
        .get<Semester[]>(
          `/academic/semesters?sessionId=${selectedSessionId}&pageSize=1000`
        )
        .then((response) => {
          setSemestersForSession(response.data || []);
        })
        .catch(() => {
          toast.error('Failed to load semesters for the selected session.');
          setSemestersForSession([]);
        })
        .finally(() => setSemestersLoading(false));
    } else {
      setSemestersForSession([]);
      setSelectedSemesterId(null); // Clear semester if session is cleared
    }
  }, [selectedSessionId]);

  // Options for dropdowns
  const studentOptions: Option[] =
    studentsData?.students.map((student) => ({
      value: student.id.toString(),
      label: `${student.firstName} ${student.lastName} (${
        student.studentId || student.id
      })`,
    })) || [];

  const academicSessionOptions: Option[] =
    academicSessionsData?.map((session) => ({
      value: session.id.toString(),
      label: session.name,
    })) || [];

  const semesterOptions: Option[] = semestersForSession.map((semester) => ({
    value: semester.id.toString(),
    label: semester.name,
  }));

  // Handlers for dropdown changes
  const handleStudentChange = (option: Option | null) => {
    setSelectedStudentId(option ? option.value : null);
    setSelectedSessionId(null); // Reset session and semester
    setSelectedSemesterId(null);
    setFetchSpecificSemesterTriggered(false); // Reset trigger
  };

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
    // Page reset will be handled by the useEffect for debouncedSearchTerm
  };

  const columns = [
    { header: 'Code', accessor: (result: Result) => result.course?.code },
    { header: 'Result Name', accessor: 'name' },
    { header: 'Credits', accessor: 'credits' },
    // Consider adding Session and Semester columns if results can span multiple
    // { header: 'Session', accessor: (r: Result) => r.semester?.academicSession?.name || 'N/A' },
    // { header: 'Semester', accessor: (r: Result) => r.semester?.name || 'N/A' },
    {
      header: 'Score',
      accessor: 'score',
    },
    { header: 'Grade', accessor: 'grade' },
    {
      header: 'Actions',
      accessor: (result: Result) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Eye size={16} />
          </button>
          <button
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/results/edit/${result.id}`);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteConfirmation({
                title: 'Delete Result',
                message: `Are you sure you want to delete result ${result.course?.code}?`,
                onConfirm: async () => {
                  await toast.promise(api.delete(`/results/${result.id}`), {
                    loading: 'Deleting...',
                    success: `Deleted result ${result.course?.name}`,
                    error: `Failed to delete user ${result.course?.name}`,
                  });
                  refetchResults();
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

  const handleSessionChange = (option: Option | null) => {
    setSelectedSessionId(option ? option.value : null);
    setSelectedSemesterId(null); // Reset semester
    setFetchSpecificSemesterTriggered(false); // Reset trigger
  };

  const handleSemesterChange = (option: Option | null) => {
    setSelectedSemesterId(option ? option.value : null);
    setFetchSpecificSemesterTriggered(false); // Reset trigger, button click will set it
  };

  const handleFetchSpecificSemesterResults = () => {
    if (selectedStudentId && selectedSessionId && selectedSemesterId) {
      setFetchSpecificSemesterTriggered(true);
      // The resultsApiUrl will update due to fetchSpecificSemesterTriggered changing,
      // and useFetch will refetch.
      // Ensure URL params are also definitively set for direct navigation/refresh
      const params = new URLSearchParams(searchParams);
      params.set('studentId', selectedStudentId);
      params.set('sessionId', selectedSessionId);
      params.set('semesterId', selectedSemesterId);
      params.set('page', '1'); // Reset to page 1 for new specific fetch
      setSearchParams(params, { replace: true });
    }
  };

  const clearFilters = () => {
    setSelectedStudentId(null);
    setSelectedSessionId(null);
    setSelectedSemesterId(null);
    setSearchTerm('');
    setFetchSpecificSemesterTriggered(false);
    // URL will be updated by the main useEffect for filter states
  };

  return (
    <>
      <div className="px-4 py-6">
        <PageHeader
          title="Result Management"
          subtitle="View and manage all results"
          actions={
            <Button
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/admin/results/add')}
            >
              Add Result
            </Button>
          }
        />
        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end pb-6">
          <div>
            <label
              htmlFor="student-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Select Student (Required)
            </label>
            <CustomSelect
              inputId="student-filter"
              options={studentOptions}
              value={
                studentOptions.find((opt) => opt.value === selectedStudentId) ||
                null
              }
              onChange={handleStudentChange}
              isLoading={studentsLoading}
              isClearable
              placeholder="Search or select student..."
            />
          </div>
          <div>
            <label
              htmlFor="session-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Academic Session (Optional)
            </label>
            <CustomSelect
              inputId="session-filter"
              options={academicSessionOptions}
              value={
                academicSessionOptions.find(
                  (opt) => opt.value === selectedSessionId
                ) || null
              }
              onChange={handleSessionChange}
              isLoading={academicSessionsLoading}
              isDisabled={!selectedStudentId || studentsLoading}
              isClearable
              placeholder="Select session..."
            />
          </div>
          <div>
            <label
              htmlFor="semester-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Semester (Optional)
            </label>
            <CustomSelect
              inputId="semester-filter"
              options={semesterOptions}
              value={
                semesterOptions.find(
                  (opt) => opt.value === selectedSemesterId
                ) || null
              }
              onChange={handleSemesterChange}
              isLoading={semestersLoading}
              isDisabled={!selectedSessionId || semestersLoading}
              isClearable
              placeholder="Select semester..."
            />
          </div>

          {/* Actions for filters */}
          <div className="flex flex-col sm:flex-row items-end gap-2 lg:col-span-1 xl:col-span-1 justify-self-start md:justify-self-end">
            {selectedStudentId && selectedSessionId && selectedSemesterId && (
              <Button
                variant="primary"
                onClick={handleFetchSpecificSemesterResults}
                className="w-full sm:w-auto mb-1 md:mb-0"
              >
                <SearchIcon size={16} className="mr-2" />
                Fetch Semester Results
              </Button>
            )}
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
                id="result-search"
                label="Search Result"
                placeholder="Search by result name or code..."
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
            data={results}
            keyField="id"
            isLoading={isLoading}
            onRowClick={() => null}
            emptyMessage={
              !selectedStudentId
                ? 'Please select a student to view results.'
                : 'No results found for the selected criteria.'
            }
          />
        </Card>
        <Pagination
          totalPages={totalPages}
          currentPage={Number(page)}
          onPageChange={handlePageChange}
        />
      </div>
      {/* {open && result && (
        <ViewResult
          result={result}
          onClose={() => setOpen(false)}
          open={open}
        />
      )} */}
      {/* You'll need to create or import ViewResult component if it's used */}
      <DeleteModal />
    </>
  );
};

// Dummy ViewResult component - replace with your actual implementation
// const ViewResult: React.FC<ViewResultProps> = ({ result, open, onClose }) => {
//   if (!open) return null;
//   return <div>Viewing result: {result.name} <button onClick={onClose}>Close</button></div>;
// };
export default ResultList;
