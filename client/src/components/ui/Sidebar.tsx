import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  School, Users, BookOpen, User, Calendar, Settings, 
  LogOut, Moon, Sun, ChevronLeft, ChevronRight, BarChart
} from 'lucide-react';

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
  const navigate = useNavigate();

  const adminNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/admin', icon: <BarChart size={20} /> },
    { title: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { title: 'Courses', path: '/admin/courses', icon: <BookOpen size={20} /> },
    { title: 'Academic Sessions', path: '/admin/academic-sessions', icon: <Calendar size={20} /> },
    { title: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const staffNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/staff', icon: <BarChart size={20} /> },
    { title: 'My Courses', path: '/staff/courses', icon: <BookOpen size={20} /> },
    { title: 'Results', path: '/staff/results', icon: <BarChart size={20} /> },
    { title: 'Profile', path: '/staff/profile', icon: <User size={20} /> },
  ];

  const studentNavItems: NavItem[] = [
    { title: 'Dashboard', path: '/student', icon: <BarChart size={20} /> },
    { title: 'My Courses', path: '/student/courses', icon: <BookOpen size={20} /> },
    { title: 'Results', path: '/student/results', icon: <BarChart size={20} /> },
    { title: 'Profile', path: '/student/profile', icon: <User size={20} /> },
  ];

  const getNavItems = () => {
    switch (role) {
      case 'Admin': return adminNavItems;
      case 'Staff': return staffNavItems;
      case 'Student': return studentNavItems;
      default: return [];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 h-screen transition-all duration-300 shadow-md flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <School size={24} className="text-blue-600 dark:text-blue-400" />
        {!collapsed && (
          <span className="ml-2 text-lg font-semibold dark:text-white">School Portal</span>
        )}
        <button 
          className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {getNavItems().map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path.split('/').length <= 2}
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <button 
          className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span className="ml-3">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        
        <button 
          className="flex items-center w-full p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;