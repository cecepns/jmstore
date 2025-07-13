import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import DashboardOverview from './admin/DashboardOverview';
import TopupManagement from './admin/TopupManagement';
import TopupAccountSettings from './admin/TopupAccountSettings';
import WithdrawalManagement from './admin/WithdrawalManagement';
import TransactionHistory from './admin/TransactionHistory';
import PackageManagement from './admin/PackageManagement';
import PPOBManagement from './admin/PPOBManagement';
import UserManagement from './admin/UserManagement';
import ProfitReport from './admin/ProfitReport';
import ApiManagement from './admin/ApiManagement';
import Profile from '../common/Profile';

const adminMenuItems = [
  { name: 'Dashboard', path: '/admin', icon: 'home' },
  { name: 'Manajemen Topup', path: '/admin/topup', icon: 'credit-card' },
  { name: 'Pengaturan Akun Topup', path: '/admin/topup-settings', icon: 'settings' },
  // { name: 'Withdrawal Management', path: '/admin/withdrawals', icon: 'dollar-sign' },
  { name: 'Manajemen Paket Data', path: '/admin/packages', icon: 'package' },
  { name: 'Manajemen PPOB', path: '/admin/ppob', icon: 'zap' },
  { name: 'Manajemen Pengguna', path: '/admin/users', icon: 'users' },
  { name: 'Riwayat Transaksi', path: '/admin/transactions', icon: 'list' },
  { name: 'Laporan Keuntungan', path: '/admin/reports', icon: 'bar-chart' },
  { name: 'Manajemen API', path: '/admin/api', icon: 'link' },
  { name: 'Profil', path: '/admin/profile', icon: 'user' },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar 
        menuItems={adminMenuItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/topup" element={<TopupManagement />} />
              <Route path="/topup-settings" element={<TopupAccountSettings />} />
              <Route path="/withdrawals" element={<WithdrawalManagement />} />
              <Route path="/packages" element={<PackageManagement />} />
              <Route path="/ppob" element={<PPOBManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/reports" element={<ProfitReport />} />
              <Route path="/api" element={<ApiManagement />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}