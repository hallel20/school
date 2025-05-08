import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { PlusCircle, Edit, Trash, Eye, Check } from 'lucide-react';

// Mock data
const mockSessions = [
  { id: 1, name: '2023/2024', current: true, semesters: ['First Semester', 'Second Semester'] },
  { id: 2, name: '2022/2023', current: false, semesters: ['First Semester', 'Second Semester'] },
  { id: 3, name: '2021/2022', current: false, semesters: ['First Semester', 'Second Semester'] },
];

const SessionsList = () => {
  const [sessions, setSessions] = useState(mockSessions);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Current', 
      accessor: (session) => (
        <div className="flex justify-center">
          {session.current && <Check size={18} className="text-green-500" />}
        </div>
      ),
      className: 'text-center',
    },
    { 
      header: 'Semesters', 
      accessor: (session) => session.semesters.join(', ') 
    },
    {
      header: 'Actions',
      accessor: (session) => (
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
              alert(`Delete session ${session.id}`);
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
          onRowClick={(session) => navigate(`/admin/academic-sessions/view/${session.id}`)}
        />
      </Card>
    </div>
  );
};

const SessionView = () => {
  return <div className="p-4">Session View (Not fully implemented in demo)</div>;
};

const SessionAdd = () => {
  return <div className="p-4">Add Session Form (Not fully implemented in demo)</div>;
};

const SessionEdit = () => {
  return <div className="p-4">Edit Session Form (Not fully implemented in demo)</div>;
};

const AcademicSessions = () => {
  return (
    <Routes>
      <Route path="/" element={<SessionsList />} />
      <Route path="/view/:id" element={<SessionView />} />
      <Route path="/add" element={<SessionAdd />} />
      <Route path="/edit/:id" element={<SessionEdit />} />
    </Routes>
  );
};

export default AcademicSessions;