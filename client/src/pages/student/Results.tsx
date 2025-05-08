import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import PieChart from '../../components/charts/PieChart';
import LineChart from '../../components/charts/LineChart';
import { CheckCircle } from 'lucide-react';

const Results = () => {
  // Filter states
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for dropdowns
  const sessionOptions = [
    { value: '', label: 'All Sessions' },
    { value: '1', label: '2023/2024' },
    { value: '2', label: '2022/2023' },
  ];
  
  const semesterOptions = [
    { value: '', label: 'All Semesters' },
    { value: '1', label: 'First Semester' },
    { value: '2', label: 'Second Semester' },
  ];
  
  // Mock results data
  const mockResults = [
    { id: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science', credits: 3, score: 85, grade: 'A', session: '2023/2024', semester: 'First Semester' },
    { id: 2, courseCode: 'MATH201', courseName: 'Advanced Mathematics', credits: 4, score: 78, grade: 'B', session: '2023/2024', semester: 'First Semester' },
    { id: 3, courseCode: 'ENG101', courseName: 'English Literature', credits: 3, score: 92, grade: 'A', session: '2023/2024', semester: 'First Semester' },
    { id: 4, courseCode: 'PHYS101', courseName: 'Physics I', credits: 4, score: 65, grade: 'C', session: '2023/2024', semester: 'First Semester' },
    { id: 5, courseCode: 'CS201', courseName: 'Data Structures', credits: 3, score: 88, grade: 'A', session: '2022/2023', semester: 'Second Semester' },
  ];
  
  // Filter results based on selections
  const filteredResults = mockResults.filter(result => {
    if (selectedSession && result.session !== sessionOptions.find(s => s.value === selectedSession)?.label) {
      return false;
    }
    if (selectedSemester && result.semester !== semesterOptions.find(s => s.value === selectedSemester)?.label) {
      return false;
    }
    return true;
  });
  
  // Calculate GPA
  const calculateGPA = (results) => {
    if (results.length === 0) return 0;
    
    const gradePoints = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0,
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    results.forEach(result => {
      totalPoints += gradePoints[result.grade] * result.credits;
      totalCredits += result.credits;
    });
    
    return (totalPoints / totalCredits).toFixed(2);
  };
  
  // Grade distribution for pie chart
  const gradeDistribution = [
    { name: 'A', value: filteredResults.filter(r => r.grade === 'A').length },
    { name: 'B', value: filteredResults.filter(r => r.grade === 'B').length },
    { name: 'C', value: filteredResults.filter(r => r.grade === 'C').length },
    { name: 'D', value: filteredResults.filter(r => r.grade === 'D').length },
    { name: 'F', value: filteredResults.filter(r => r.grade === 'F').length },
  ].filter(item => item.value > 0);
  
  // GPA trend data
  const gpaTrendData = [
    { semester: 'Sem 1 2022', gpa: 3.5 },
    { semester: 'Sem 2 2022', gpa: 3.6 },
    { semester: 'Sem 1 2023', gpa: 3.7 },
  ];
  
  // Table columns
  const columns = [
    { header: 'Course Code', accessor: 'courseCode' },
    { header: 'Course Name', accessor: 'courseName' },
    { header: 'Credits', accessor: 'credits' },
    { header: 'Session', accessor: 'session' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Score', accessor: 'score' },
    { 
      header: 'Grade', 
      accessor: (result) => (
        <div className={`font-semibold ${
          result.grade === 'A' ? 'text-green-600 dark:text-green-400' :
          result.grade === 'B' ? 'text-blue-600 dark:text-blue-400' :
          result.grade === 'C' ? 'text-amber-600 dark:text-amber-400' :
          result.grade === 'D' ? 'text-orange-600 dark:text-orange-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {result.grade}
        </div>
      ) 
    },
  ];
  
  return (
    <div className="px-4 py-6">
      <PageHeader 
        title="Academic Results" 
        subtitle="View your course results and academic performance"
      />
      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-center h-28">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-1">GPA</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {calculateGPA(filteredResults)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card title="Grade Distribution">
          <PieChart data={gradeDistribution} height={200} />
        </Card>
      </div>
      
      <Card title="GPA Trend" className="mb-6">
        <LineChart
          data={gpaTrendData}
          xAxisKey="semester"
          lines={[{ dataKey: 'gpa', name: 'GPA', color: '#7E3AF2' }]}
          height={250}
        />
      </Card>
      
      <Card title="Course Results">
        <Table
          columns={columns}
          data={filteredResults}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No results found for the selected filters"
        />
      </Card>
    </div>
  );
};

export default Results;