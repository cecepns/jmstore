import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';

export default function ResetPassword() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('https://api-inventory.isavralabel.com/api/jmstore/auth/reset-password', {
        phone: phone
      });
      setSuccess('Password baru telah dikirim ke WhatsApp Anda. Silakan cek pesan WhatsApp Anda.');
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal mengirim password baru');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center">
            <FiPhone className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan nomor HP Anda untuk menerima password baru via WhatsApp
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Nomor HP
            </label>
            <div className="mt-1 relative">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Contoh: 08123456789"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Password baru akan dikirim ke nomor WhatsApp yang terdaftar
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mengirim...' : 'Kirim Password Baru'}
            </button>
          </div>
          
          <div className="text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <FiArrowLeft className="mr-1 h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 