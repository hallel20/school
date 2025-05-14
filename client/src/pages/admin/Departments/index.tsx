import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const DepartmentList = lazy(() => import('./home'));
const CreateDepartment = lazy(() => import('./create'));
const EditDepartment = lazy(() => import('./edit'));
const NotFound = lazy(() => import('../../NotFound'));
const ViewDepartment = lazy(() => import('./view'));
const DepartmentCourses = lazy(() => import('./courses'));

const Courses = () => {
  return (
    <Routes>
      <Route path="/" element={<DepartmentList />} />
      <Route path="/add" element={<CreateDepartment />} />
      <Route path="/edit/:id" element={<EditDepartment />} />
      {/* <Route path="/view/:id" element={<ViewDepartment />} /> */}
      {/* Uncomment the above line if you want to use the ViewDepartment component */}
      <Route path="/:id" element={<ViewDepartment />} />
      <Route path="/courses/*" element={<DepartmentCourses />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Courses;
