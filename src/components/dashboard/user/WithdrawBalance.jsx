import { useState, useEffect } from 'react';
import { FiDollarSign, FiCreditCard, FiUser, FiFileText } from 'react-icons/fi';
import axios from 'axios';

export default function WithdrawBalance() {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    amount: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    notes: ''
  });

  useEffect(() => {
    fetchCurrentBalance();
  }, []);

  const fetchCurrentBalance = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/balance');
      setCurrentBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error fetching current balance:', error);
      setCurrentBalance(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('https://api-inventory.isavralabel.com/api/jmstore/user/withdraw', formData);
      setSuccess(true);
      setFormData({
        amount: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        notes: ''
      });
      fetchCurrentBalance(); // Refresh balance
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal mengajukan permintaan penarikan');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { amount, bank_name, account_number, account_name } = formData;
    return amount && parseFloat(amount) > 0 && 
           parseFloat(amount) <= currentBalance &&
           bank_name && account_number && account_name;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tarik Saldo</h1>
        <p className="text-gray-600">Ajukan penarikan saldo ke rekening bank Anda</p>
      </div>

      {/* Current Balance Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center">
          <div className="bg-primary-500 p-3 rounded-lg">
            <FiDollarSign className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Saldo Saat Ini</p>
            <p className="text-2xl font-semibold text-gray-900">
              Rp {Math.round(currentBalance || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Form Penarikan Saldo</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-600">
                Permintaan penarikan berhasil diajukan! Tim kami akan memproses dalam 1-2 hari kerja.
              </p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Penarikan
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="10000"
                max={currentBalance}
                step="1000"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Masukkan jumlah penarikan"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Minimum: Rp 10.000 | Maksimum: Rp {Math.round(currentBalance || 0).toLocaleString()}
            </p>
          </div>

          {/* Bank Name */}
          <div>
            <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Bank
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Contoh: BCA, Mandiri, BNI"
                required
              />
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Rekening
            </label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              value={formData.account_number}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Masukkan nomor rekening"
              required
            />
          </div>

          {/* Account Name */}
          <div>
            <label htmlFor="account_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pemilik Rekening
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="account_name"
                name="account_name"
                value={formData.account_name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nama sesuai buku tabungan"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                <FiFileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Catatan tambahan untuk admin"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!validateForm() || loading}
              className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                validateForm() && !loading
                  ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? 'Mengirim...' : 'Ajukan Penarikan'}
            </button>
          </div>
        </form>
      </div>

      {/* Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Informasi Penting:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Minimum penarikan: Rp 10.000</li>
          <li>• Proses penarikan memakan waktu 1-2 hari kerja</li>
          <li>• Pastikan data rekening sudah benar dan sesuai</li>
          <li>• Saldo akan langsung terpotong saat pengajuan disetujui</li>
          <li>• Jika penarikan ditolak, saldo akan dikembalikan</li>
        </ul>
      </div>
    </div>
  );
} 