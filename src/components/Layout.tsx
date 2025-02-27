import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Home, 
  Users, 
  PieChart, 
  LogOut, 
  Menu, 
  X, 
  DollarSign,
  UserPlus
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/login');
    }
  }, [user, location.pathname, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (!user && location.pathname !== '/login' && location.pathname !== '/signup') {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-800' : '';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed inset-y-0 left-0 w-64 transition duration-300 transform bg-indigo-700 overflow-y-auto lg:static lg:inset-0 z-40`}
      >
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-white" />
            <span className="text-white text-2xl mx-2 font-semibold">SplitWise</span>
          </div>
        </div>

        <nav className="mt-10">
          {user && (
            <>
              <Link
                to="/"
                className={`flex items-center px-6 py-3 text-white hover:bg-indigo-800 ${isActive('/')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span className="mx-3">Dashboard</span>
              </Link>
              <Link
                to="/groups"
                className={`flex items-center px-6 py-3 text-white hover:bg-indigo-800 ${isActive('/groups')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span className="mx-3">Groups</span>
              </Link>
              <Link
                to="/friends"
                className={`flex items-center px-6 py-3 text-white hover:bg-indigo-800 ${isActive('/friends')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="h-5 w-5" />
                <span className="mx-3">Friends</span>
              </Link>
              <Link
                to="/reports"
                className={`flex items-center px-6 py-3 text-white hover:bg-indigo-800 ${isActive('/reports')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <PieChart className="h-5 w-5" />
                <span className="mx-3">Reports</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-6 py-3 text-white hover:bg-indigo-800"
              >
                <LogOut className="h-5 w-5" />
                <span className="mx-3">Sign Out</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                {location.pathname === '/' && 'Dashboard'}
                {location.pathname === '/groups' && 'Groups'}
                {location.pathname === '/friends' && 'Friends'}
                {location.pathname === '/reports' && 'Reports'}
                {location.pathname.startsWith('/group/') && 'Group Details'}
              </h1>
              {user && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">
                    {user.displayName}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;