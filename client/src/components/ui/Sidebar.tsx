import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  School,
  Users,
  BookOpen,
  User,
  Calendar,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  BarChart,
  Building,
  ListChecks,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: 'Student' | 'Staff' | 'Admin';
}

const Sidebar = ({ role }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const adminNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/admin', icon: <BarChart size={16} /> },
    { title: 'Users', path: '/admin/users', icon: <Users size={16} /> },
    { title: 'Courses', path: '/admin/courses', icon: <BookOpen size={16} /> },
    {
      title: 'Departments',
      path: '/admin/departments',
      icon: <Building size={16} />,
    },
    {
      title: 'Faculties',
      path: '/admin/faculties',
      icon: <Building size={16} />,
    },
    {
      title: 'Academic Sessions',
      path: '/admin/academic-sessions',
      icon: <Calendar size={16} />,
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: <Settings size={16} />,
    },
  ];

  const staffNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/staff', icon: <BarChart size={16} /> },
    {
      title: 'My Courses',
      path: '/staff/courses',
      icon: <BookOpen size={16} />,
    },
    {
      title: 'Results',
      path: '/staff/results',
      icon: <ListChecks size={16} />,
    },
    { title: 'Profile', path: '/staff/profile', icon: <User size={16} /> },
  ];

  const studentNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/student', icon: <BarChart size={16} /> },
    {
      title: 'My Courses',
      path: '/student/courses',
      icon: <BookOpen size={16} />,
    },
    {
      title: 'Results',
      path: '/student/results',
      icon: <BarChart size={16} />,
    },
    { title: 'Profile', path: '/student/profile', icon: <User size={16} /> },
  ];

  const getNavItems = () => {
    switch (role) {
      case 'Admin':
        return adminNavItems;
      case 'Staff':
        return staffNavItems;
      case 'Student':
        return studentNavItems;
      default:
        return [];
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 h-screen transition-all duration-300 shadow-md flex flex-col ${
        collapsed ? 'w-16' : 'w-56' // Reduced width
      }`}
    >
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700">
        {' '}
        {/* Reduced padding */}
        <School size={18} className="text-blue-600 dark:text-blue-400" />{' '}
        {/* Reduced icon size */}
        {!collapsed && (
          <span className="ml-1.5 text-base font-semibold dark:text-white">
            {' '}
            {/* Reduced margin and text size */}
            School Portal
          </span>
        )}
        <button
          className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}{' '}
          {/* Reduced icon size */}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2.5">
        {' '}
        {/* Reduced vertical padding */}
        <ul className="space-y-1 px-4">
          {' '}
          {/* Reduced spacing and horizontal padding */}
          {getNavItems().map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path.split('/').length <= 2}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors ${
                    // Reduced padding
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="ml-2 text-sm">{item.title}</span>
                )}{' '}
                {/* Reduced margin and text size */}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-1.5">
        {' '}
        {/* Reduced padding and spacing */}
        <button
          className="flex items-center w-full p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" // Reduced padding
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}{' '}
          {/* Reduced icon size */}
          {!collapsed && (
            <span className="ml-2 text-sm">
              {' '}
              {/* Reduced margin and text size */}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
        <button
          className="flex items-center w-full p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900" // Reduced padding
          onClick={handleLogout}
        >
          <LogOut size={16} /> {/* Reduced icon size */}
          {!collapsed && <span className="ml-2 text-sm">Logout</span>}{' '}
          {/* Reduced margin and text size */}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;