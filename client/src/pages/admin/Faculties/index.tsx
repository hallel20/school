import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const FacultyList = lazy(() => import('./home'));
const CreateFaculty = lazy(() => import('./create'));
const EditFaculty = lazy(() => import('./edit'));
const NotFound = lazy(() => import('../../NotFound'));
// const ViewFaculty = lazy(() => import('./view'));

const Courses = () => {
  return (
    <Routes>
      <Route path="/" element={<FacultyList />} />
      <Route path="/add" element={<CreateFaculty />} />
      <Route path="/edit/:id" element={<EditFaculty />} />
      {/* <Route path="/:id" element={<ViewFaculty />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Courses;
