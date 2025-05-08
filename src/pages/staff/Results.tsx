import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { Save, FileText } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  // Mock data for dropdowns
  const courseOptions = [
    { value: '1', label: 'CS101 - Introduction to Computer Science' },
    { value: '2', label: 'MATH201 - Advanced Mathematics' },
    { value: '3', label: 'CS301 - Database Systems' },
  ];
  
  const sessionOptions = [
    { value: '1', label: '2023/2024' },
    { value: '2', label: '2022/2023' },
  ];
  
  const semesterOptions = [
    { value: '1', label: 'First Semester' },
    { value: '2', label: 'Second Semester' },
  ];
  
  // Mock students data
  const mockStudents = [
    { id: 1, studentId: 'STU001', firstName: 'John', lastName: 'Doe', score: 85, grade: 'A' },
    { id: 2, studentId: 'STU002', firstName: 'Jane', lastName: 'Smith', score: 78, grade: 'B' },
    { id: 3, studentId: 'STU003', firstName: 'Michael', lastName: 'Johnson', score: 92, grade: 'A' },
    { id: 4, studentId: 'STU004', firstName: 'Emily', lastName: 'Brown', score: 65, grade: 'C' },
    { id: 5, studentId: 'STU005', firstName: 'David', lastName: 'Wilson', score: 72, grade: 'B' },
  ];
  
  const [students, setStudents] = useState(mockStudents);
  
  // Table columns
  const columns = [
    { header: 'Student ID', accessor: 'studentId' },
    { header: 'First Name', accessor: 'firstName' },
    { header: 'Last Name', accessor: 'lastName' },
    { 
      header: 'Score', 
      accessor: (student) => (
        <input
          type="number"
          min="0"
          max="100"
          value={student.score}
          onChange={(e) => {
            const updatedStudents = students.map(s => 
              s.id === student.id ? { ...s, score: parseInt(e.target.value) } : s
            );
            setStudents(updatedStudents);
          }}
          className="w-16 p-1 border border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      ) 
    },
    { 
      header: 'Grade', 
      accessor: (student) => (
        <select
          value={student.grade}
          onChange={(e) => {
            const updatedStudents = students.map(s => 
              s.id === student.id ? { ...s, grade: e.target.value } : s
            );
            setStudents(updatedStudents);
          }}
          className="p-1 border border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      ) 
    },
  ];
  
  const handleSaveResults = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Results saved successfully!');
    }, 1000);
  };
  
  return (
    <div className="px-4 py-6">
      <PageHeader 
        title="Manage Results" 
        subtitle="Enter and update student results for your courses"
      />
      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Course"
            options={courseOptions}
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            fullWidth
          />
          
          <Select
            label="Academic Session"
            options={sessionOptions}
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            fullWidth
          />
          
          <Select
            label="Semester"
            options={semesterOptions}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            fullWidth
          />
        </div>
      </Card>
      
      {selectedCourse && selectedSession && selectedSemester ? (
        <Card
          title="Student Results"
          footer={
            <div className="flex justify-end">
              <Button
                variant="primary"
                leftIcon={<Save size={16} />}
                isLoading={isLoading}
                onClick={handleSaveResults}
              >
                Save Results
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            data={students}
            keyField="id"
            isLoading={false}
          />
        </Card>
      ) : (
        <Card className="text-center py-10">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Filters to View Results
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please select a course, academic session, and semester to view and manage student results.
          </p>
        </Card>
      )}
    </div>
  );
};

export default Results;