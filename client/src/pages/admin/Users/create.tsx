import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import UserForm from "../../../components/users/form";
import Card from "../../../components/ui/Card";

export default function AddUser() {
  const navigate = useNavigate();
  return (
    <div className="px-4 py-6">
      <PageHeader
        title="Add User"
        subtitle="Create a new user"
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/users')}
          >
            Back to Users
          </Button>
        }
      />
      <Card>
        <UserForm />
      </Card>
    </div>
  );
}