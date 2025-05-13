import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import SessionForm from '@/components/academicSessions/form';

export default function AddSession() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Add Session"
        subtitle={`Add a new session`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/academic-sessions')}
          >
            Back to Sessions
          </Button>
        }
      />
      <Card>
        <SessionForm />
      </Card>
    </div>
  );
}
