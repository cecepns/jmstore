import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

export default function TopupAccountSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [formData, setFormData] = useState({
    payment_method: '',
    display_name: '',
    account_name: '',
    account_number: '',
    bank_name: '',
    qr_code_url: '',
    instructions: '',
    minimum_amount: 10000,
    maximum_amount: 5000000,
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/topup-settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching topup settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSetting) {
        await axios.put(`https://api-inventory.isavralabel.com/api/jmstore/admin/topup-settings/${editingSetting.id}`, formData);
      } else {
        await axios.post('https://api-inventory.isavralabel.com/api/jmstore/admin/topup-settings', formData);
      }
      
      fetchSettings();
      setShowAddForm(false);
      setEditingSetting(null);
      setFormData({
        payment_method: '',
        display_name: '',
        account_name: '',
        account_number: '',
        bank_name: '',
        qr_code_url: '',
        instructions: '',
        minimum_amount: 10000,
        maximum_amount: 5000000,
        is_active: true,
        sort_order: 0
      });
    } catch (error) {
      console.error('Error saving topup setting:', error);
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setFormData({
      payment_method: setting.payment_method,
      display_name: setting.display_name,
      account_name: setting.account_name || '',
      account_number: setting.account_number || '',
      bank_name: setting.bank_name || '',
      qr_code_url: setting.qr_code_url || '',
      instructions: setting.instructions || '',
      minimum_amount: setting.minimum_amount,
      maximum_amount: setting.maximum_amount,
      is_active: setting.is_active,
      sort_order: setting.sort_order
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengaturan ini?')) {
      try {
        await axios.delete(`https://api-inventory.isavralabel.com/api/jmstore/admin/topup-settings/${id}`);
        fetchSettings();
      } catch (error) {
        console.error('Error deleting topup setting:', error);
      }
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'bank_transfer':
        return '🏦';
      case 'e_wallet':
        return '💳';
      case 'qris':
        return '📱';
      case 'internet_banking':
        return '💻';
      default:
        return '💰';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Memuat...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun Top Up</h1>
          <p className="text-gray-600">Kelola metode pembayaran untuk top up saldo</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white rounded px-3 py-2 flex items-center"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Tambah Metode Pembayaran
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingSetting ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Pilih Metode</option>
                    <option value="bank_transfer">Transfer Bank</option>
                    <option value="e_wallet">E-Wallet</option>
                    <option value="qris">QRIS</option>
                    <option value="internet_banking">Internet Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Tampilan</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Akun</label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomor Akun</label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Bank</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL QR Code</label>
                  <input
                    type="url"
                    value={formData.qr_code_url}
                    onChange={(e) => setFormData({...formData, qr_code_url: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jumlah Minimum</label>
                  <input
                    type="number"
                    value={formData.minimum_amount}
                    onChange={(e) => setFormData({...formData, minimum_amount: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jumlah Maksimum</label>
                  <input
                    type="number"
                    value={formData.maximum_amount}
                    onChange={(e) => setFormData({...formData, maximum_amount: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Urutan</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Aktif</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instruksi Pembayaran</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="4"
                  placeholder="Masukkan instruksi pembayaran yang akan ditampilkan kepada pengguna..."
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white rounded px-3 py-2">
                  {editingSetting ? 'Update' : 'Tambah'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSetting(null);
                    setFormData({
                      payment_method: '',
                      display_name: '',
                      account_name: '',
                      account_number: '',
                      bank_name: '',
                      qr_code_url: '',
                      instructions: '',
                      minimum_amount: 10000,
                      maximum_amount: 5000000,
                      is_active: true,
                      sort_order: 0
                    });
                  }}
                  className="bg-gray-500 text-white rounded px-3 py-2"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Informasi Akun
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batas Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urutan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.map((setting) => (
                <tr key={setting.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getPaymentMethodIcon(setting.payment_method)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{setting.display_name}</div>
                        <div className="text-sm text-gray-500">{setting.payment_method}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {setting.account_name && <div>Nama: {setting.account_name}</div>}
                      {setting.account_number && <div>No: {setting.account_number}</div>}
                      {setting.bank_name && <div>Bank: {setting.bank_name}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>Min: Rp {setting.minimum_amount?.toLocaleString()}</div>
                    <div>Max: Rp {setting.maximum_amount?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      setting.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {setting.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {setting.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(setting)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(setting.id)}
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
      </div>

      {settings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada pengaturan metode pembayaran</p>
        </div>
      )}
    </div>
  );
} 