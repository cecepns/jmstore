import { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import axios from 'axios';

export default function ProfitReport() {
  const [reportData, setReportData] = useState({
    totalProfit: 0,
    monthlyProfit: 0,
    profitGrowth: 0,
    topPackages: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchProfitReport();
  }, [dateRange]);

  const fetchProfitReport = async () => {
    try {
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/admin/profit-report', {
        params: dateRange
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching profit report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Memuat...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuntungan</h1>
          <p className="text-gray-600">Pantau performa bisnis dan keuntungan Anda</p>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Profit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-primary-500 p-3 rounded-lg">
              <FiDollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Keuntungan</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rp {reportData.totalProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-secondary-500 p-3 rounded-lg">
              <FiCalendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Keuntungan Bulanan</p>
              <p className="text-2xl font-semibold text-gray-900">
                Rp {reportData.monthlyProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-accent-500 p-3 rounded-lg">
              <FiTrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tingkat Pertumbuhan</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reportData.profitGrowth > 0 ? '+' : ''}{reportData.profitGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Packages */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paket Terlaris</h3>
          <div className="space-y-4">
            {reportData.topPackages.map((pkg, index) => (
              <div key={pkg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-sm text-gray-500">{pkg.type} - {pkg.provider}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{pkg.total_sales} penjualan</div>
                  <div className="text-sm text-gray-500">Rp {pkg.total_profit.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Profit Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tren Keuntungan Bulanan</h3>
          <div className="space-y-4">
            {reportData.monthlyData.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{month.month}</div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(month.profit / Math.max(...reportData.monthlyData.map(m => m.profit))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Rp {month.profit.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}