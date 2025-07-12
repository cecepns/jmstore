import { useAuth } from '../../contexts/AuthContext';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'user':
        return 'Pengguna';
      case 'seller':
        return 'Penjual';
      case 'reseller':
        return 'Reseller';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <h2 className="ml-4 text-xl font-semibold text-gray-800 capitalize">
            Dashboard {getRoleDisplayName(user?.role)}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <FiBell className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <FiUser className="h-5 w-5 text-white" />
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-700">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{getRoleDisplayName(user?.role)}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}