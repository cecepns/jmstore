import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import axios from 'axios';

export default function BalanceHistory() {
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [stats, setStats] = useState({
    totalTopups: 0,
    totalSpent: 0,
    totalWithdrawals: 0,
    thisMonth: 0
  });

  useEffect(() => {
    fetchBalanceHistory();
    fetchCurrentBalance();
  }, []);

  const fetchBalanceHistory = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/balance-history');
      setBalanceHistory(response.data.history);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching balance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentBalance = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/balance');
      setCurrentBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error fetching current balance:', error);
      setCurrentBalance(0);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup':
        return <FiTrendingUp className="h-5 w-5 text-green-500" />;
      case 'purchase':
        return <FiTrendingDown className="h-5 w-5 text-red-500" />;
      case 'refund':
        return <FiTrendingUp className="h-5 w-5 text-blue-500" />;
      case 'withdrawal':
        return <FiTrendingDown className="h-5 w-5 text-orange-500" />;
      case 'adjustment':
        return <FiTrendingDown className="h-5 w-5 text-purple-500" />;
      default:
        return <FiDollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup':
      case 'refund':
        return 'text-green-600';
      case 'purchase':
      case 'withdrawal':
      case 'adjustment':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAmountPrefix = (type) => {
    switch (type) {
      case 'topup':
      case 'refund':
        return '+';
      case 'purchase':
      case 'withdrawal':
      case 'adjustment':
        return '-';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Memuat riwayat saldo...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Saldo</h1>
        <p className="text-gray-600">Lacak perubahan saldo dan transaksi Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-primary-500 p-3 rounded-lg">
              <FiDollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Saldo Saat Ini</p>
              <p className="text-2xl font-semibold text-gray-900">Rp {Math.round(currentBalance || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <FiTrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Top Up</p>
              <p className="text-2xl font-semibold text-gray-900">Rp {Math.round(stats.totalTopups || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg">
              <FiTrendingDown className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="text-2xl font-semibold text-gray-900">Rp {Math.round(stats.totalSpent || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg">
              <FiTrendingDown className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Penarikan</p>
              <p className="text-2xl font-semibold text-gray-900">Rp {Math.round(stats.totalWithdrawals || 0).toLocaleString()}</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Balance History List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Perubahan Saldo Terbaru</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {balanceHistory.length > 0 ? (
            balanceHistory.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {getTransactionIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getTransactionColor(item.type)}`}>
                      {getAmountPrefix(item.type)}Rp {Math.round(Math.abs(item.amount || 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Saldo: Rp {Math.round(item.balance_after || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">Tidak ada riwayat saldo ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}