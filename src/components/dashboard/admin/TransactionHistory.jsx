import { useState, useEffect } from 'react';
import { FiDownload, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import SearchBar from '../../common/SearchBar';
import Pagination from '../../common/Pagination';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.currentPage, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/transactions', { params });
      setTransactions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveTransaction = async (transactionId) => {
    try {
      setActionLoading(prev => ({ ...prev, [transactionId]: true }));
      
      await axios.put(`https://api-inventory.isavralabel.com/api/jmstore/admin/transactions/${transactionId}/approve`);
      
      // Refresh transactions
      await fetchTransactions();
      
      alert('Transaksi berhasil disetujui!');
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Gagal menyetujui transaksi: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    if (!confirm('Apakah Anda yakin ingin menolak transaksi ini? Pengguna akan dikembalikan dananya.')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [transactionId]: true }));
      
      await axios.put(`https://api-inventory.isavralabel.com/api/jmstore/admin/transactions/${transactionId}/reject`);
      
      // Refresh transactions
      await fetchTransactions();
      
      alert('Transaksi berhasil ditolak! Pengguna telah dikembalikan dananya.');
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Gagal menolak transaksi: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const exportTransactions = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/transactions/export', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Memuat...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600">Lihat dan kelola semua transaksi</p>
        </div>
        <button
          onClick={exportTransactions}
          className="bg-danger-500 text-white rounded px-3"
        >
          <FiDownload className="mr-2 h-4 w-4" />
          Ekspor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SearchBar
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
            onClear={() => handleFilterChange('search', '')}
            placeholder="Cari transaksi..."
            debounce={true}
            debounceDelay={500}
          />

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="pending">Menunggu</option>
            <option value="failed">Gagal</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Jenis</option>
            <option value="purchase">Pembelian</option>
            <option value="topup">Top Up</option>
            <option value="refund">Pengembalian</option>
            <option value="adjustment">Penyesuaian Saldo</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Dari Tanggal"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Sampai Tanggal"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.user_name}</div>
                    <div className="text-sm text-gray-500">{transaction.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.transaction_type === 'adjustment' ? (
                      <div>
                        <div className="text-sm text-gray-900">Penyesuaian Saldo</div>
                        <div className="text-sm text-gray-500">{transaction.description}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-900">{transaction.package_name}</div>
                        <div className="text-sm text-gray-500">{transaction.package_type}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status === 'completed' ? 'Selesai' : 
                       transaction.status === 'pending' ? 'Menunggu' : 
                       transaction.status === 'failed' ? 'Gagal' : transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.status === 'pending' && transaction.transaction_type !== 'adjustment' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveTransaction(transaction.id)}
                          disabled={actionLoading[transaction.id]}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <FiCheck className="mr-1 h-3 w-3" />
                          {actionLoading[transaction.id] ? 'Memproses...' : 'Setujui'}
                        </button>
                        <button
                          onClick={() => handleRejectTransaction(transaction.id)}
                          disabled={actionLoading[transaction.id]}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <FiX className="mr-1 h-3 w-3" />
                          {actionLoading[transaction.id] ? 'Memproses...' : 'Tolak'}
                        </button>
                      </div>
                    )}
                    {transaction.transaction_type === 'adjustment' && (
                      <span className="text-xs text-gray-500">Aksi Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}