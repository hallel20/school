import { useNavigate } from "react-router-dom";
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import UserForm from '@/components/users/form';
import Card from '@/components/ui/Card';

export default function AddUser() {
  const navigate = useNavigate();
  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Add Staff"
        subtitle="Create a new staff account"
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/staff')}
          >
            Back to Users
          </Button>
        }
      />
      <Card>
        <UserForm account="Staff" />
      </Card>
    </div>
  );
}