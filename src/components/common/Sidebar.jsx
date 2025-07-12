import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';
import { 
  FiHome, FiCreditCard, FiPackage, FiUsers, FiList, 
  FiBarChart, FiUser, FiShoppingCart, FiActivity, 
  FiLogOut, FiX, FiMenu, FiDollarSign, FiClock 
} from 'react-icons/fi';

const iconMap = {
  home: FiHome,
  'credit-card': FiCreditCard,
  package: FiPackage,
  users: FiUsers,
  list: FiList,
  'bar-chart': FiBarChart,
  user: FiUser,
  'shopping-cart': FiShoppingCart,
  activity: FiActivity,
  logout: FiLogOut,
  menu: FiMenu,
  x: FiX,
  'dollar-sign': FiDollarSign,
  clock: FiClock,
};

export default function Sidebar({ menuItems, isOpen, onToggle }) {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">JM Store</h1>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = iconMap[item.icon] || FiHome; // Fallback to FiHome if icon not found
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => onToggle()}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="text-left">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <FiLogOut className="mr-3 h-5 w-5" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}

Sidebar.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};