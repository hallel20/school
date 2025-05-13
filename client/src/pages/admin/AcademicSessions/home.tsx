import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { PlusCircle, Edit, Trash, Eye, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '@/hooks/useFetch';
import { AcademicSession } from '@/types';

const SessionsList = () => {
  const navigate = useNavigate();

    const { data: sessions, loading: isLoading } = useFetch<AcademicSession[]>('/academic/sessions');

  const columns = [
    { header: 'Name', accessor: 'name' },
    {
      header: 'Current',
      accessor: (session: AcademicSession) => (
        <div className="flex justify-center">
          {session.current && <Check size={18} className="text-green-500" />}
        </div>
      ),
      className: 'text-center',
    },
    {
      header: 'Semesters',
      accessor: (session: AcademicSession) => session.semesters?.map(semester => semester.name).join(", "),
    },
    {
      header: 'Actions',
      accessor: (session: AcademicSession) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/academic-sessions/view/${session.id}`);
            }}
          >
            <Eye size={16} />
          </button>
          <button
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/academic-sessions/edit/${session.id}`);
            }}
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              // Show delete confirmation (not implemented in this demo)
              toast.success(`Delete session ${session.id}`);
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
        title="Academic Session Management"
        subtitle="View and manage academic sessions and semesters"
        actions={
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => navigate('/admin/academic-sessions/add')}
          >
            Add Session
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          data={sessions}
          keyField="id"
          isLoading={isLoading}
          onRowClick={(session: AcademicSession) =>
            navigate(`/admin/academic-sessions/edit/${session.id}`)
          }
        />
      </Card>
    </div>
  );
};

export default SessionsList;