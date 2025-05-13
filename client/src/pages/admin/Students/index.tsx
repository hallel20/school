import { Routes, Route } from 'react-router-dom';
import { lazy } from 'react';

const AddStudent = lazy(() => import('./create'));
const EditStudent = lazy(() => import('./edit'));
// const ViewUser = lazy(() => import('./view'));
const StudentList = lazy(() => import('./home'));

const Students = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentList />} />
      {/* <Route path="/view/:id" element={<ViewUser />} /> */}
      <Route path="/add" element={<AddStudent />} />
      <Route path="/edit/:id" element={<EditStudent />} />
    </Routes>
  );
};

export default Students;
