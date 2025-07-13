import { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../common/SearchBar';
import useToast from '../../../hooks/useToast';

export default function BuyPackage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    provider: ''
  });

  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    fetchPackages();
    fetchBalance();
  }, [filters]);

  const fetchPackages = async () => {
    try {
      const params = { ...filters };
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/packages', { params });
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      showError('Gagal memuat paket');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/balance');
      setBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePurchase = async () => {
    if (!phoneNumber) {
      showWarning('Masukkan nomor telepon terlebih dahulu');
      return;
    }

    if (!selectedPackage) {
      showWarning('Pilih paket terlebih dahulu');
      return;
    }

    setPurchaseLoading(true);

    try {
      const response = await axios.post('https://api-inventory.isavralabel.com/api/jmstore/user/purchase', {
        package_id: selectedPackage.id,
        phone_number: phoneNumber
      });

      // Check if the response contains a success message or if success is true
      if (response.data.success || response.data.message?.includes('successfully')) {
        const successMessage = response.data.message || 'Pembelian berhasil! Paket akan diproses dalam beberapa menit.';
        
        // Show success toast
        showSuccess(successMessage);
        
        // Close modal and reset form
        setShowPurchaseModal(false);
        setSelectedPackage(null);
        setPhoneNumber('');
        fetchBalance();
      } else {
        showError(response.data.message || 'Gagal melakukan pembelian. Silakan coba lagi.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      showError(errorMessage);
    } finally {
      setPurchaseLoading(false);
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

  if (loading) {
    return <div className="animate-pulse">Memuat paket...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Beli Paket</h1>
        <p className="text-gray-600">Beli paket pulsa dan kuota</p>
      </div>

      {/* Balance Info */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Saldo Saat Ini</p>
            <p className="text-xl font-semibold text-gray-900">Rp {Math.floor(balance || 0).toLocaleString()}</p>
          </div>
          <a href="/user/topup" className="btn btn-primary">
            Isi Saldo
          </a>
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Telepon
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Masukkan nomor telepon (contoh: 08123456789)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-600">{pkg.denomination}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(pkg.type)}`}>
                    {pkg.type}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{pkg.provider}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  Rp {pkg.display_price?.toLocaleString()}
                </div>
                {/* <div className="text-sm text-gray-500">
                  Harga: Rp {pkg.price?.toLocaleString()}
                </div> */}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pkg.status)}`}>
                  {pkg.status === 'active' ? 'Tersedia' : 'Tidak Tersedia'}
                </span>
                <span className="text-xs text-gray-500">
                  Stok: {pkg.stock || '-'}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedPackage(pkg);
                  setShowPurchaseModal(true);
                }}
                disabled={pkg.status !== 'active' || pkg.display_price > balance || !phoneNumber.trim()}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  pkg.status === 'active' && pkg.display_price <= balance && phoneNumber.trim()
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!phoneNumber.trim() ? 'Masukkan Nomor Telepon' : 
                 pkg.display_price > balance ? 'Saldo Tidak Cukup' : 'Beli Sekarang'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Pembelian</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Paket</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <div className="font-medium">{selectedPackage.name}</div>
                  <div className="text-sm text-gray-600">{selectedPackage.denomination}</div>
                  {selectedPackage.description && (
                    <div className="text-sm text-gray-500 mt-2">
                      {selectedPackage.description}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {phoneNumber}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Harga</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <div className="text-xl font-bold text-gray-900">
                    Rp {selectedPackage.display_price?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Saldo Setelah Pembelian</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <div className="text-lg font-medium text-gray-900">
                    Rp {(balance - selectedPackage.display_price).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePurchase}
                disabled={purchaseLoading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchaseLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  'Konfirmasi Pembelian'
                )}
              </button>
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setSelectedPackage(null);
                }}
                disabled={purchaseLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}