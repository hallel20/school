import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const AllowedCoursesViewPage = lazy(() => import('./home'));
const AllowedCoursesManagePage = lazy(() => import('./manage'));


export default function DepartmentCourses() {
  return (
    <Routes>
      <Route path="/" element={<AllowedCoursesViewPage />} />
      <Route path='/manage' element={<AllowedCoursesManagePage />} />
    </Routes>
  );
}
