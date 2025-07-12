import { useState, useEffect } from 'react';
import { FiSettings, FiSend, FiTestTube } from 'react-icons/fi';
import axios from 'axios';

export default function WhatsAppSettings() {
  const [settings, setSettings] = useState({
    endpoint_url: '',
    api_key: '',
    api_secret: '',
    admin_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [testMessage, setTestMessage] = useState('Test WhatsApp notification from Pulsa Store');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/whatsapp-settings');
      const { whatsappSettings, adminNumber } = response.data;
      
      if (whatsappSettings) {
        setSettings({
          endpoint_url: whatsappSettings.endpoint_url || '',
          api_key: whatsappSettings.api_key || '',
          api_secret: whatsappSettings.api_secret || '',
          admin_number: adminNumber || ''
        });
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
      setMessage('Gagal memuat pengaturan WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await axios.put('https://api-inventory.isavralabel.com/api/jmstore/admin/whatsapp-settings', settings);
      setMessage('Pengaturan WhatsApp berhasil disimpan!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal menyimpan pengaturan WhatsApp');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage('');

    try {
      await axios.post('https://api-inventory.isavralabel.com/api/jmstore/admin/test-whatsapp', {
        test_message: testMessage
      });
      setMessage('Test WhatsApp berhasil dikirim!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal mengirim test WhatsApp');
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="animate-pulse">Memuat pengaturan WhatsApp...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan WhatsApp Gateway</h1>
        <p className="text-gray-600">Konfigurasi notifikasi WhatsApp untuk order manual</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.includes('berhasil') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiSettings className="mr-2" />
            Konfigurasi Gateway
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint URL
              </label>
              <input
                type="url"
                value={settings.endpoint_url}
                onChange={(e) => handleInputChange('endpoint_url', e.target.value)}
                placeholder="https://app.multichat.id/api/v1/send-text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key (Token)
              </label>
              <input
                type="text"
                value={settings.api_key}
                onChange={(e) => handleInputChange('api_key', e.target.value)}
                placeholder="YOUR_TOKEN_HERE"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Secret (Instance ID)
              </label>
              <input
                type="text"
                value={settings.api_secret}
                onChange={(e) => handleInputChange('api_secret', e.target.value)}
                placeholder="YOUR_INSTANCE_ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp Admin
              </label>
              <input
                type="text"
                value={settings.admin_number}
                onChange={(e) => handleInputChange('admin_number', e.target.value)}
                placeholder="08123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nomor WhatsApp yang akan menerima notifikasi order manual
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FiSend className="mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm mt-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiTestTube className="mr-2" />
            Test Notifikasi
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesan Test
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan pesan test..."
              />
            </div>

            <button
              onClick={handleTest}
              disabled={testing || !settings.endpoint_url || !settings.api_key || !settings.api_secret || !settings.admin_number}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <FiTestTube className="mr-2" />
              {testing ? 'Mengirim Test...' : 'Kirim Test WhatsApp'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Informasi Format API</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>URL:</strong> https://app.multichat.id/api/v1/send-text</p>
          <p><strong>Method:</strong> POST</p>
          <p><strong>Headers:</strong> Content-Type: application/json</p>
          <p><strong>Body:</strong></p>
          <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "token": "YOUR_TOKEN_HERE",
  "instance_id": "YOUR_INSTANCE_ID",
  "jid": "62XXXXXXXXXX@s.whatsapp.net",
  "msg": "Pesan yang akan dikirim"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
} 