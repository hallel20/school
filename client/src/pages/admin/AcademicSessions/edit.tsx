import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import SessionForm from '@/components/academicSessions/form';
import useFetch from '@/hooks/useFetch';
import { AcademicSession } from '@/types';
import AdminNotFound from '@/components/AdminNotFound';
import Spinner from '@/components/ui/Spinner';

export default function EditSession() {
    const navigate = useNavigate();
    const id = useParams().id;

    const { data: session, loading } = useFetch<AcademicSession>('/academic/sessions/' + id);
    
    if (loading) return <Spinner />;

    if (!session) {
      return (
        <AdminNotFound
          id={String(id)}
          title="Academic Session"
          route="academic-session"
          dashboard="admin"
        />
      );
    }
    

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
        <SessionForm academicSession={session} />
      </Card>
    </div>
  );
}
