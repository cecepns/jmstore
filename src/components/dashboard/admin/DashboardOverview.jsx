import { useState, useEffect } from 'react';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPackage, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import axios from 'axios';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalPackages: 0,
    monthlyGrowth: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Pengguna',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-primary-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Total Transaksi',
      value: stats.totalTransactions,
      icon: FiTrendingUp,
      color: 'bg-secondary-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Total Pendapatan',
      value: `Rp ${stats.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-accent-500',
      change: '+15%',
      changeType: 'increase'
    },
    {
      name: 'Total Paket',
      value: stats.totalPackages,
      icon: FiPackage,
      color: 'bg-purple-500',
      change: '+3%',
      changeType: 'increase'
    }
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600">Ringkasan performa bisnis Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <FiArrowUp className="h-4 w-4 text-secondary-500" />
              ) : (
                <FiArrowDown className="h-4 w-4 text-danger-500" />
              )}
              <span className={`ml-1 text-sm ${
                stat.changeType === 'increase' ? 'text-secondary-500' : 'text-danger-500'
              }`}>
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">dari bulan lalu</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transaksi Terbaru</h3>
          <div className="space-y-4">
            {stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.package_name}</p>
                    <p className="text-sm text-gray-600">{transaction.user_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Rp {transaction.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada transaksi terbaru</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Pengguna Baru</p>
                <p className="text-sm text-blue-700">5 pengguna mendaftar hari ini</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Hari ini</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Transaksi Selesai</p>
                <p className="text-sm text-green-700">12 transaksi berhasil diproses</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Hari ini</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-900">Top Up Tertunda</p>
                <p className="text-sm text-yellow-700">3 permintaan top up menunggu</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-yellow-600">Menunggu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}