import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User, Mail, Key, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Staff',
    lastName: user?.lastName || 'User',
    email: user?.email || 'staff@school.com',
    staffId: 'STAFF001',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsProfileLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProfileLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    
    setIsPasswordLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsPasswordLoading(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert('Password changed successfully!');
    }, 1000);
  };
  
  return (
    <div className="px-4 py-6">
      <PageHeader 
        title="My Profile" 
        subtitle="View and update your personal information"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <User size={64} className="text-gray-600 dark:text-gray-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                {profileData.firstName} {profileData.lastName}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Staff ID: {profileData.staffId}
              </p>
              
              <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <div className="flex items-center mb-2">
                  <Mail size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{profileData.email}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Update Profile Form */}
        <div className="lg:col-span-2">
          <Card title="Update Profile">
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  label="First Name"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  fullWidth
                  required
                />
                
                <Input
                  label="Last Name"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  fullWidth
                  required
                />
                
                <Input
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  fullWidth
                  required
                />
                
                <Input
                  label="Staff ID"
                  id="staffId"
                  name="staffId"
                  value={profileData.staffId}
                  onChange={handleProfileChange}
                  disabled
                  fullWidth
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Save size={16} />}
                  isLoading={isProfileLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
          
          <Card title="Change Password" className="mt-6">
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 mb-6">
                <Input
                  label="Current Password"
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  leftIcon={<Key size={16} />}
                />
                
                <Input
                  label="New Password"
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  leftIcon={<Key size={16} />}
                />
                
                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  leftIcon={<Key size={16} />}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Key size={16} />}
                  isLoading={isPasswordLoading}
                >
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;