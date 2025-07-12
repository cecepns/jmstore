import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardMenuGrid from '../../common/DashboardMenuGrid';
import axios from 'axios';

export default function ResellerOverview() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    balance: 0,
    totalTransactions: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/stats');
      setStats({
        balance: response.data.balance || 0,
        totalTransactions: response.data.totalTransactions || 0,
        totalSpent: response.data.totalSpent || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { key: 'topup', label: 'Isi Saldo', icon: 'credit-card', onClick: () => navigate('/reseller/topup') },
    { key: 'buy', label: 'Beli Paket', icon: 'shopping', onClick: () => navigate('/reseller/buy') },
    { key: 'riwayat', label: 'Riwayat', icon: 'clock-outline', onClick: () => navigate('/reseller/transactions') },
    { key: 'mutasi', label: 'Mutasi', icon: 'swap-horizontal', onClick: () => navigate('/reseller/balance-history') },
    // { key: 'withdraw', label: 'Tarik Saldo', icon: 'dollar-sign', onClick: () => navigate('/reseller/withdraw') },
    { key: 'profil', label: 'Profil', icon: 'account', onClick: () => navigate('/reseller/profile') },
    { key: 'logout', label: 'Logout', icon: 'power', onClick: handleLogout },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <DashboardMenuGrid
      name={user?.name || 'Reseller'}
      role={user?.role || 'Reseller'}
      saldo={stats.balance.toLocaleString()}
      totalDeposit={stats.totalSpent.toLocaleString()}
      totalTransaksi={stats.totalTransactions}
      menuItems={menuItems}
      onLogout={handleLogout}
    />
  );
}