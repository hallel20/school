import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const CoursesList = lazy(() => import('./home'));
const EditCourse = lazy(() => import('./edit'));
const AddCourse = lazy(() => import('./create'));
const NotFound = lazy(() => import('../../NotFound'));

const Courses = () => {
  return (
    <Routes>
      <Route path="/" element={<CoursesList />} />
      <Route path="/add" element={<AddCourse />} />
      <Route path="/edit/:id" element={<EditCourse />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Courses;
