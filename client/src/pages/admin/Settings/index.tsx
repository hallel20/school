import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import useFetch from '@/hooks/useFetch';
import { AcademicSession, SchoolSetting } from '@/types';
import Spinner from '@/components/ui/Spinner';

const Settings = () => {
  const {
    data: ogSettings,
    loading,
    refetch,
  } = useFetch<SchoolSetting>('/settings');

  const [settings, setSettings] = useState<SchoolSetting>({
    id: 0,
    name: '',
    address: '',
    currentAcademicSessionId: null,
    currentAcademicSession: null,
    semestersPerSession: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: sessions } = useFetch<AcademicSession[]>('/academic/sessions');
  const academicSessions = sessions?.map((session) => ({
    label: session.name,
    value: session.id,
  }));

  const semesterOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully!');
      refetch();
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ogSettings) {
      setSettings(ogSettings);
    }
  }, [ogSettings]);

  return (
    <div className="px-4 py-6">
      <PageHeader
        title="School Settings"
        subtitle="Configure school information and preferences"
      />

      <Card>
        {loading ? (
          <Spinner />
        ) : (
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
                  value={settings.currentAcademicSessionId || ''}
                  onChange={handleChange}
                  options={academicSessions || [{ label: '', value: '' }]}
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
        )}
      </Card>
    </div>
  );
};

export default Settings;
