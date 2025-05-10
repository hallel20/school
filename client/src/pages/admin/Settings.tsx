import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    name: 'Example University',
    address: '123 Education Street, Knowledge City, 12345',
    currentAcademicSessionId: 1,
    semestersPerSession: 2,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Mock sessions for dropdown
  const academicSessions = [
    { value: 1, label: '2023/2024' },
    { value: 2, label: '2022/2023' },
    { value: 3, label: '2021/2022' },
  ];

  const semesterOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="School Settings"
        subtitle="Configure school information and preferences"
      />

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="School Name"
                id="name"
                name="name"
                value={settings.name}
                onChange={handleChange}
                fullWidth
                required
              />

              <Input
                label="School Address"
                id="address"
                name="address"
                value={settings.address}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Current Academic Session"
                id="currentAcademicSessionId"
                name="currentAcademicSessionId"
                value={settings.currentAcademicSessionId}
                onChange={handleChange}
                options={academicSessions}
                fullWidth
                required
              />

              <Select
                label="Semesters Per Session"
                id="semestersPerSession"
                name="semestersPerSession"
                value={settings.semestersPerSession}
                onChange={handleChange}
                options={semesterOptions}
                fullWidth
                required
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save size={16} />}
                isLoading={isLoading}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Settings;