import { Routes, Route } from 'react-router-dom';
import { lazy } from 'react';

const AddUser = lazy(() => import('./create'));
const EditStaff = lazy(() => import('./edit'));
// const ViewUser = lazy(() => import('./view'));
const StaffList = lazy(() => import('./home'));

const Staff = () => {
  return (
    <Routes>
      <Route path="/" element={<StaffList />} />
      {/* <Route path="/view/:id" element={<ViewUser />} /> */}
      <Route path="/add" element={<AddUser />} />
      <Route path="/edit/:id" element={<EditStaff />} />
    </Routes>
  );
};

export default Staff;
