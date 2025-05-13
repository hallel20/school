import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

const ResultList = lazy(() => import('./home'));

export default function Results() {
  return (
    <Routes>
      <Route path="/" element={<ResultList />} />
    </Routes>
  );
}
