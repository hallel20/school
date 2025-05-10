import { Routes, Route } from 'react-router-dom';
import { lazy } from 'react';

const AddUser = lazy(() => import('./create'));
const EditUser = lazy(() => import('./edit'));
const ViewUser = lazy(() => import('./view'));
const UsersList = lazy(() => import('./home'));

const Users = () => {
  return (
    <Routes>
      <Route path="/" element={<UsersList />} />
      <Route path="/view/:id" element={<ViewUser />} />
      <Route path="/add" element={<AddUser />} />
      <Route path="/edit/:id" element={<EditUser />} />
    </Routes>
  );
};

export default Users;
