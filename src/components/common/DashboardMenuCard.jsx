import { 
  FiCreditCard, FiShoppingCart, FiClock, FiRepeat, 
  FiUser, FiPower, FiPackage, FiUsers, FiList, 
  FiBarChart, FiActivity, FiLogOut, FiX, FiMenu 
} from 'react-icons/fi';
import PropTypes from 'prop-types';

// Mapping function to convert icon names to react-icons components
const getIconComponent = (iconName) => {
  const iconMap = {
    'credit-card': FiCreditCard,
    'shopping': FiShoppingCart,
    'clock-outline': FiClock,
    'swap-horizontal': FiRepeat,
    'account': FiUser,
    'power': FiPower,
    'package': FiPackage,
    'users': FiUsers,
    'list': FiList,
    'bar-chart': FiBarChart,
    'activity': FiActivity,
    'logout': FiLogOut,
    'x': FiX,
    'menu': FiMenu,
  };
  
  return iconMap[iconName] || FiUser; // Default to FiUser if icon not found
};

export default function DashboardMenuCard({ label, icon, onClick }) {
  const IconComponent = getIconComponent(icon);
  
  return (
    <button
      className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-6 hover:bg-sky-50 transition"
      onClick={onClick}
      type="button"
    >
      <IconComponent className="text-sky-500 mb-2" size={32} />
      <span className="font-medium text-lg">{label}</span>
    </button>
  );
}

DashboardMenuCard.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}; 