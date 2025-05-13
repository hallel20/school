import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

const SessionsList = lazy(() => import("./home"));
const AddSession = lazy(() => import("./create"));
const EditSession = lazy(() => import('./edit'));
// const ViewSession = lazy(() => import("./view"))
 
const AcademicSessions = () => {
  return (
    <Routes>
      <Route path="/" element={<SessionsList />} />
      {/* <Route path="/view/:id" element={<SessionView />} /> */}
      <Route path="/add" element={<AddSession />} />
      <Route path="/edit/:id" element={<EditSession />} />
    </Routes>
  );
};

export default AcademicSessions;