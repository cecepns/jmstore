import { useState, useEffect } from 'react';
import { FiPlus, FiUser, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import Select from 'react-select';
import SearchBar from '../../common/SearchBar';
import Pagination from '../../common/Pagination';

export default function TopupManagement() {
  const [topups, setTopups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: ''
  });
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    type: 'manual',
    description: ''
  });

  // Transform users data for react-select
  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`
  }));

  useEffect(() => {
    fetchTopups();
    fetchUsers();
  }, [pagination.currentPage, filters]);

  const fetchTopups = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/topups', { params });
      setTopups(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching topups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/users');
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.userId || !formData.amount) {
      alert('Mohon isi semua field yang diperlukan');
      return;
    }
    
    try {
      await axios.post('https://api-inventory.isavralabel.com/api/jmstore/admin/topups', formData);
      fetchTopups();
      setShowAddForm(false);
      setFormData({
        userId: '',
        amount: '',
        type: 'manual',
        description: ''
      });
    } catch (error) {
      console.error('Error adding topup:', error);
    }
  };

  const handleApprove = async (topupId) => {
    try {
      await axios.put(`https://api-inventory.isavralabel.com/api/jmstore/admin/topups/${topupId}/approve`);
      fetchTopups();
    } catch (error) {
      console.error('Error approving topup:', error);
    }
  };

  const handleReject = async (topupId) => {
    try {
      await axios.put(`https://api-inventory.isavralabel.com/api/jmstore/admin/topups/${topupId}/reject`);
      fetchTopups();
    } catch (error) {
      console.error('Error rejecting topup:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'pending':
        return 'Menunggu';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Memuat...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Top Up</h1>
          <p className="text-gray-600">Kelola top up saldo pengguna</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white rounded px-3 py-2"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Tambah Top Up Manual
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
            onClear={() => handleFilterChange('search', '')}
            placeholder="Cari berdasarkan nama atau email pengguna..."
            debounce={true}
            debounceDelay={500}
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Jenis</option>
            <option value="manual">Manual</option>
            <option value="payment">Pembayaran</option>
          </select>
        </div>
      </div>

      {/* Add Topup Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Tambah Top Up Manual</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pengguna</label>
                <Select
                  value={userOptions.find(option => option.value === formData.userId)}
                  onChange={(selectedOption) => setFormData({...formData, userId: selectedOption?.value || ''})}
                  options={userOptions}
                  placeholder="Pilih Pengguna"
                  isClearable
                  isSearchable
                  isLoading={usersLoading}
                  noOptionsMessage={() => "Tidak ada pengguna ditemukan"}
                  loadingMessage={() => "Memuat pengguna..."}
                  className="mt-1"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                      '&:hover': {
                        borderColor: '#3b82f6'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
                      }
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9ca3af'
                    })
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white rounded px-3 py-2">
                  Tambah Top Up
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white rounded px-3 py-2"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topups Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
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
              {topups.map((topup) => (
                <tr key={topup.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <FiUser className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{topup.user_name}</div>
                        <div className="text-sm text-gray-500">{topup.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {topup.amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topup.type === 'manual' ? 'Manual' : 'Pembayaran'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(topup.status)}`}>
                      {getStatusLabel(topup.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(topup.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {topup.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(topup.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(topup.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
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