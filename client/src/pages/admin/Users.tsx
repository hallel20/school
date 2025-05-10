import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data
const mockUsers = [
  {
    id: 1,
    email: 'john.doe@school.com',
    role: 'Student',
    firstName: 'John',
    lastName: 'Doe',
    studentId: 'STU001',
  },
  {
    id: 2,
    email: 'jane.smith@school.com',
    role: 'Student',
    firstName: 'Jane',
    lastName: 'Smith',
    studentId: 'STU002',
  },
  {
    id: 3,
    email: 'prof.johnson@school.com',
    role: 'Staff',
    firstName: 'Robert',
    lastName: 'Johnson',
    staffId: 'STAFF001',
  },
  {
    id: 4,
    email: 'admin@school.com',
    role: 'Admin',
    firstName: 'Admin',
    lastName: 'User',
  },
];

const UsersList = () => {
  const [users, setUsers] = useState(mockUsers);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'First Name', accessor: 'firstName' },
    { header: 'Last Name', accessor: 'lastName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    {
      header: 'Actions',
      accessor: (user) => (
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
              // Show delete confirmation (not implemented in this demo)
              toast.success(`Delete user ${user.id}`);
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

      <Card>
        <Table
          columns={columns}
          data={users}
          keyField="id"
          isLoading={isLoading}
          onRowClick={(user) => navigate(`/admin/users/view/${user.id}`)}
        />
      </Card>
    </div>
  );
};

const UserView = () => {
  return <div className="p-4">User View (Not fully implemented in demo)</div>;
};

const UserAdd = () => {
  return <div className="p-4">Add User Form (Not fully implemented in demo)</div>;
};

const UserEdit = () => {
  return <div className="p-4">Edit User Form (Not fully implemented in demo)</div>;
};

const Users = () => {
  return (
    <Routes>
      <Route path="/" element={<UsersList />} />
      <Route path="/view/:id" element={<UserView />} />
      <Route path="/add" element={<UserAdd />} />
      <Route path="/edit/:id" element={<UserEdit />} />
    </Routes>
  );
};

export default Users;