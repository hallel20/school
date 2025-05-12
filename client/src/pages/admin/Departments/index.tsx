import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const DepartmentList = lazy(() => import('./home'));
const NotFound = lazy(() => import('../../NotFound'));
const ViewDepartment = lazy(() => import('./view'));

const Courses = () => {
  return (
    <Routes>
      <Route path="/" element={<DepartmentList />} />
      <Route path="/:id" element={<ViewDepartment />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Courses;
