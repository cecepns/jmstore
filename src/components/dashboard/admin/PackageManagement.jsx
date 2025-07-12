import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import SearchBar from '../../common/SearchBar';
import Pagination from '../../common/Pagination';

export default function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    price_user: '',
    price_seller: '',
    price_reseller: '',
    type: 'pulsa',
    provider: '',
    denomination: '',
    category: 'manual',
    package_api_id: '',
    status: 'active',
    stock: '',
    available_for: ['user', 'seller', 'reseller']
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    provider: '',
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchPackages();
  }, [pagination.currentPage, filters]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/packages', { params });
      setPackages(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching packages:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        await axios.put(`https://api-inventory.isavralabel.com/api/jmstore/admin/packages/${editingPackage.id}`, formData);
      } else {
        await axios.post('https://api-inventory.isavralabel.com/api/jmstore/admin/packages', formData);
      }
      fetchPackages();
      setShowAddForm(false);
      setEditingPackage(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        price_user: '',
        price_seller: '',
        price_reseller: '',
        type: 'pulsa',
        provider: '',
        denomination: '',
        category: 'manual',
        package_api_id: '',
        status: 'active',
        stock: '',
        available_for: ['user', 'seller', 'reseller']
      });
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    
    // Handle available_for parsing
    let availableForArray = ['user', 'seller', 'reseller']; // default
    if (pkg.available_for) {
      if (typeof pkg.available_for === 'string') {
        try {
          availableForArray = JSON.parse(pkg.available_for);
        } catch (error) {
          console.error('Error parsing available_for:', error);
        }
      } else if (Array.isArray(pkg.available_for)) {
        availableForArray = pkg.available_for;
      }
    }
    
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      price_user: pkg.price_user,
      price_seller: pkg.price_seller,
      price_reseller: pkg.price_reseller,
      type: pkg.type,
      provider: pkg.provider,
      denomination: pkg.denomination,
      category: pkg.category,
      package_api_id: pkg.package_api_id || '',
      status: pkg.status,
      stock: pkg.stock,
      available_for: availableForArray
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
      try {
        await axios.delete(`https://api-inventory.isavralabel.com/api/jmstore/admin/packages/${id}`);
        fetchPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pulsa':
        return 'bg-blue-100 text-blue-800';
      case 'kuota':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'manual':
        return 'bg-orange-100 text-orange-800';
      case 'api':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAvailableFor = (availableFor) => {
    if (!availableFor) return '-';
    
    // Handle case where availableFor is a JSON string
    let availableForArray;
    if (typeof availableFor === 'string') {
      try {
        const parsed = JSON.parse(availableFor);
        availableForArray = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Error parsing available_for:', error);
        return '-';
      }
    } else if (Array.isArray(availableFor)) {
      availableForArray = availableFor;
    } else {
      return '-';
    }
    
    if (!Array.isArray(availableForArray) || availableForArray.length === 0) {
      return '-';
    }
    
    return availableForArray.map(role => {
      switch (role) {
        case 'user':
          return 'User';
        case 'seller':
          return 'Seller';
        case 'reseller':
          return 'Reseller';
        default:
          return role;
      }
    }).join(', ');
  };

  if (loading) {
    return <div className="animate-pulse">Memuat...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Paket</h1>
          <p className="text-gray-600">Kelola paket pulsa dan data</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white rounded px-3 py-2"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Tambah Paket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SearchBar
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
            onClear={() => handleFilterChange('search', '')}
            placeholder="Cari paket..."
            debounce={true}
            debounceDelay={500}
          />
          
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Jenis</option>
            <option value="pulsa">Pulsa</option>
            <option value="kuota">Kuota</option>
          </select>

          <select
            value={filters.provider}
            onChange={(e) => handleFilterChange('provider', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Provider</option>
            <option value="telkomsel">Telkomsel</option>
            <option value="xl">XL</option>
            <option value="indosat">Indosat</option>
            <option value="tri">Tri</option>
            <option value="smartfren">Smartfren</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Kategori</option>
            <option value="manual">Manual</option>
            <option value="api">API</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingPackage ? 'Edit Paket' : 'Tambah Paket Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="pulsa">Pulsa</option>
                  <option value="kuota">Kuota</option>
                  <option value="voucher">Voucher</option>
                  <option value="e-wallet">E-Wallet</option>
                  <option value="token">Token</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Pilih Provider</option>
                  <option value="telkomsel">Telkomsel</option>
                  <option value="xl">XL</option>
                  <option value="indosat">Indosat</option>
                  <option value="tri">Tri</option>
                  <option value="smartfren">Smartfren</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value, package_api_id: ''})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="manual">Manual</option>
                  <option value="api">API</option>
                </select>
              </div>

              {formData.category === 'api' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Package API ID</label>
                  <input
                    type="text"
                    value={formData.package_api_id}
                    onChange={(e) => setFormData({...formData, package_api_id: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Masukkan Package API ID"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Denominasi</label>
                <input
                  type="text"
                  value={formData.denomination}
                  onChange={(e) => setFormData({...formData, denomination: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Contoh: 10.000, 25.000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Admin</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Harga User</label>
                <input
                  type="number"
                  value={formData.price_user}
                  onChange={(e) => setFormData({...formData, price_user: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Seller</label>
                <input
                  type="number"
                  value={formData.price_seller}
                  onChange={(e) => setFormData({...formData, price_seller: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Reseller</label>
                <input
                  type="number"
                  value={formData.price_reseller}
                  onChange={(e) => setFormData({...formData, price_reseller: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stok</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tersedia Untuk</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Array.isArray(formData.available_for) && formData.available_for.includes('user')}
                      onChange={(e) => {
                        const currentAvailableFor = Array.isArray(formData.available_for) ? formData.available_for : [];
                        const newAvailableFor = e.target.checked
                          ? [...currentAvailableFor, 'user']
                          : currentAvailableFor.filter(role => role !== 'user');
                        setFormData({...formData, available_for: newAvailableFor});
                      }}
                      className="mr-2"
                    />
                    User
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Array.isArray(formData.available_for) && formData.available_for.includes('seller')}
                      onChange={(e) => {
                        const currentAvailableFor = Array.isArray(formData.available_for) ? formData.available_for : [];
                        const newAvailableFor = e.target.checked
                          ? [...currentAvailableFor, 'seller']
                          : currentAvailableFor.filter(role => role !== 'seller');
                        setFormData({...formData, available_for: newAvailableFor});
                      }}
                      className="mr-2"
                    />
                    Seller
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Array.isArray(formData.available_for) && formData.available_for.includes('reseller')}
                      onChange={(e) => {
                        const currentAvailableFor = Array.isArray(formData.available_for) ? formData.available_for : [];
                        const newAvailableFor = e.target.checked
                          ? [...currentAvailableFor, 'reseller']
                          : currentAvailableFor.filter(role => role !== 'reseller');
                        setFormData({...formData, available_for: newAvailableFor});
                      }}
                      className="mr-2"
                    />
                    Reseller
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white rounded px-3 py-2">
                  {editingPackage ? 'Perbarui Paket' : 'Tambah Paket'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPackage(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      price_user: '',
                      price_seller: '',
                      price_reseller: '',
                      type: 'pulsa',
                      provider: '',
                      denomination: '',
                      category: 'manual',
                      package_api_id: '',
                      status: 'active',
                      stock: '',
                      available_for: ['user', 'seller', 'reseller']
                    });
                  }}
                  className="bg-danger-500 text-white rounded px-3"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Daftar Paket</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tersedia Untuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-gray-500">{pkg.denomination}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(pkg.type)}`}>
                      {pkg.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pkg.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(pkg.category)}`}>
                      {pkg.category === 'manual' ? 'Manual' : 'API'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {pkg.price_user?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pkg.stock || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAvailableFor(pkg.available_for)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
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