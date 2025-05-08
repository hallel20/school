import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types
type Role = 'Student' | 'Staff' | 'Admin';

interface User {
  id: number;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // In a real app, verify the token with your backend
          // For now, we'll mock this by getting the user from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would make an API call to your backend
      // For demonstration, we'll mock this with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - in real app this would come from your API
      // For demo, we'll hardcode some users
      let mockUser: User | null = null;
      
      if (email === 'admin@school.com' && password === 'password') {
        mockUser = { id: 1, email, role: 'Admin', firstName: 'Admin', lastName: 'User' };
      } else if (email === 'staff@school.com' && password === 'password') {
        mockUser = { id: 2, email, role: 'Staff', firstName: 'Staff', lastName: 'User' };
      } else if (email === 'student@school.com' && password === 'password') {
        mockUser = { id: 3, email, role: 'Student', firstName: 'Student', lastName: 'User' };
      } else {
        throw new Error('Invalid credentials');
      }
      
      // Save to localStorage - in a real app, you'd store the JWT token
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};