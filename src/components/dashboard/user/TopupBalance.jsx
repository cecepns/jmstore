import { useState, useEffect } from 'react';
import { FiCreditCard, FiDollarSign, FiWifi } from 'react-icons/fi';
import axios from 'axios';

export default function TopupBalance() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const quickAmounts = [10000, 25000, 50000, 100000, 200000, 500000];

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'bank_transfer':
        return FiCreditCard;
      case 'e_wallet':
        return FiDollarSign;
      case 'qris':
        return FiWifi;
      case 'internet_banking':
        return FiWifi;
      default:
        return FiCreditCard;
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchPaymentMethods();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/balance');
      setBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/topup-methods');
      setPaymentMethods(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('https://api-inventory.isavralabel.com/api/jmstore/user/topup', {
        amount: parseInt(amount),
        payment_method: paymentMethod
      });

      if (response.data.message) {
        setMessage('Permintaan top up berhasil dikirim! Admin akan memproses pembayaran Anda.');
        setAmount('');
        setPaymentMethod('');
        fetchBalance();
      } else {
        setMessage('Gagal mengirim permintaan top up. Silakan coba lagi.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Isi Saldo</h1>
        <p className="text-gray-600">Tambah saldo ke akun Anda</p>
      </div>

      {/* Balance Info */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Saldo Saat Ini</p>
            <p className="text-xl font-semibold text-gray-900">Rp {Math.floor(balance || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Top Up Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tambah Dana</h3>
        
        {message && (
          <div className={`p-4 rounded-md mb-4 ${
            message.includes('berhasil') 
              ? 'bg-secondary-50 text-secondary-700' 
              : 'bg-danger-50 text-danger-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masukkan jumlah"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
              min="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Cepat
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleQuickAmount(value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
                >
                  Rp {value.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const IconComponent = getPaymentMethodIcon(method.payment_method);
                return (
                  <label key={method.id} className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.payment_method}
                      checked={paymentMethod === method.payment_method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <IconComponent className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{method.display_name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Payment Instructions */}
          {paymentMethod && paymentMethods.find(m => m.payment_method === paymentMethod)?.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Instruksi Pembayaran:</h4>
              <div className="text-sm text-blue-700 whitespace-pre-line">
                {paymentMethods.find(m => m.payment_method === paymentMethod)?.instructions}
              </div>
              
              {/* QR Code Display for QRIS */}
              {paymentMethod === 'qris' && paymentMethods.find(m => m.payment_method === paymentMethod)?.qr_code_url && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">QR Code:</h5>
                  <div className="flex justify-center">
                    <img 
                      src={paymentMethods.find(m => m.payment_method === paymentMethod)?.qr_code_url}
                      alt="QRIS QR Code"
                      className="w-full max-w-96 h-auto object-contain border border-gray-300 rounded-lg bg-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-sm text-red-600 text-center">
                      QR Code tidak dapat ditampilkan. Silakan hubungi admin.
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 text-center mt-2">
                    Scan QR code di atas menggunakan aplikasi e-wallet atau mobile banking Anda
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !amount || !paymentMethod}
            className="w-full bg-primary-500 text-white py-3"
          >
            {loading ? 'Memproses...' : 'Kirim Permintaan Top Up'}
          </button>
        </form>
      </div>

      {/* Payment Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Informasi Penting:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Minimum top up: Rp 10.000</li>
          <li>• Proses top up memakan waktu 1-2 jam setelah pembayaran</li>
          <li>• Pastikan pembayaran dilakukan sesuai instruksi</li>
          <li>• Simpan bukti pembayaran untuk konfirmasi</li>
          <li>• Jika ada masalah, hubungi admin</li>
        </ul>
      </div>
    </div>
  );
}