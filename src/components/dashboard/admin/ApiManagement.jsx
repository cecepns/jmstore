import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';

export default function ApiManagement() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [formData, setFormData] = useState({
    provider: '',
    api_key: '',
    api_secret: '',
    endpoint_url: '',
    method: 'GET',
    is_active: true
  });

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/api-settings');
      setApis(response.data.data);
    } catch (error) {
      console.error('Error fetching API settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingApi) {
        await axios.put(`https://api-inventory.isavralabel.com/api/jmstore/admin/api-settings/${editingApi.id}`, formData);
      } else {
        await axios.post('https://api-inventory.isavralabel.com/api/jmstore/admin/api-settings', formData);
      }
      
      fetchApis();
      setShowAddForm(false);
      setEditingApi(null);
      setFormData({
        provider: '',
        api_key: '',
        api_secret: '',
        endpoint_url: '',
        method: 'GET',
        is_active: true
      });
    } catch (error) {
      console.error('Error saving API setting:', error);
    }
  };

  const handleEdit = (api) => {
    setEditingApi(api);
    setFormData({
      provider: api.provider,
      api_key: api.api_key || '',
      api_secret: api.api_secret || '',
      endpoint_url: api.endpoint_url || '',
      method: api.method || 'GET',
      is_active: api.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus API setting ini?')) {
      try {
        await axios.delete(`https://api-inventory.isavralabel.com/api/jmstore/admin/api-settings/${id}`);
        fetchApis();
      } catch (error) {
        console.error('Error deleting API setting:', error);
      }
    }
  };

  // const togglePasswordVisibility = (id) => {
  //   setShowPassword(prev => ({
  //     ...prev,
  //     [id]: !prev[id]
  //   }));
  // };

  const getProviderIcon = (provider) => {
    switch (provider.toLowerCase()) {
      case 'whatsapp_gateway':
        return '💬';
      case 'payment_gateway':
        return '💳';
      case 'sms_gateway':
        return '📱';
      case 'email_service':
        return '📧';
      case 'pulsa_api':
        return '📞';
      case 'kuota_api':
        return '📶';
      default:
        return '🔗';
    }
  };

  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen API</h1>
          <p className="text-gray-600">Kelola pengaturan API untuk berbagai layanan</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Tambah API
        </button>
      </div>

      {/* API List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar API Settings</h2>
          
          {apis.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada API settings yang ditambahkan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
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
                  {apis.map((api) => (
                    <tr key={api.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getProviderIcon(api.provider)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {api.provider.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {api.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {api.endpoint_url || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(api.method)}`}>
                          {api.method || 'GET'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          api.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {api.is_active ? (
                            <>
                              <FiCheck className="mr-1" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <FiX className="mr-1" />
                              Nonaktif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-4">
                          {/* <button
                            onClick={() => togglePasswordVisibility(api.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Toggle password visibility"
                          >
                            {showPassword[api.id] ? <FiEyeOff /> : <FiEye />}
                          </button> */}
                          <button
                            onClick={() => handleEdit(api)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(api.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingApi ? 'Edit API Setting' : 'Tambah API Setting'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                    placeholder="whatsapp_gateway"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={formData.api_key}
                    onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                    placeholder="YOUR_API_KEY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Secret
                  </label>
                  <input
                    type="text"
                    value={formData.api_secret}
                    onChange={(e) => setFormData({...formData, api_secret: e.target.value})}
                    placeholder="YOUR_API_SECRET"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={formData.endpoint_url}
                    onChange={(e) => setFormData({...formData, endpoint_url: e.target.value})}
                    placeholder="https://api.example.com/endpoint"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Aktif
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingApi ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingApi(null);
                      setFormData({
                        provider: '',
                        api_key: '',
                        api_secret: '',
                        endpoint_url: '',
                        method: 'GET',
                        is_active: true
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 