import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import NotFound from '@/pages/NotFound';
import { useNavigate } from 'react-router-dom';

interface NotFoundProps {
  id: string;
  title: string;
  route: string;
  dashboard: string;
}

export default function AdminNotFound(props: NotFoundProps) {
  const navigate = useNavigate();
  return (
    <div className="px-4 py-6">
      <PageHeader
        title={`${props.title} not found`}
        subtitle={`Course ${props.id} not found`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate(`/${props.dashboard}/${props.route}`)}
          >
            Back to Courses
          </Button>
        }
      />
      <NotFound />
    </div>
  );
}
