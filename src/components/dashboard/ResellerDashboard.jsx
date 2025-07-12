import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import ResellerOverview from './reseller/ResellerOverview';
import BuyPackage from './user/BuyPackage';
import TopupBalance from './user/TopupBalance';
import TransactionHistory from './user/TransactionHistory';
import BalanceHistory from './user/BalanceHistory';
import WithdrawBalance from './user/WithdrawBalance';
import WithdrawalHistory from './user/WithdrawalHistory';
import Profile from '../common/Profile';

export default function ResellerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const isOverview = location.pathname === '/reseller' || location.pathname === '/reseller/';

  if (isOverview) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <ResellerOverview />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white sticky top-0 left-0 right-0 z-10 shadow-sm border-b border-gray-200 h-16 flex items-center px-4">
        <button
          onClick={() => navigate('/reseller')}
          className="text-gray-700 hover:text-sky-500 flex items-center"
        >
          <FiArrowLeft className="h-6 w-6 mr-2" />
          <span className="font-medium">Kembali</span>
        </button>
      </header>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="topup" element={<TopupBalance />} />
            <Route path="buy" element={<BuyPackage />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="balance-history" element={<BalanceHistory />} />
            <Route path="withdraw" element={<WithdrawBalance />} />
            <Route path="withdrawal-history" element={<WithdrawalHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="." />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}