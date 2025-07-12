import DashboardMenuCard from "./DashboardMenuCard";
import PropTypes from "prop-types";

const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800";
    case "reseller":
      return "bg-purple-100 text-purple-800";
    case "seller":
      return "bg-blue-100 text-blue-800";
    case "user":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "reseller":
      return "Reseller";
    case "seller":
      return "Penjual";
    case "user":
      return "Pengguna";
    default:
      return role;
  }
};

export default function DashboardMenuGrid({
  name,
  role,
  saldo,
  totalDeposit,
  totalTransaksi,
  menuItems,
  onLogout,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 justify-center">
        👋 Halo, {name}{" "}
        <span
          className={`px-2 py-1 text-xs rounded-full ${getRoleColor(role)}`}
        >
          {getRoleLabel(role)}
        </span>
      </h2>
      <div className="bg-white rounded-xl p-6 shadow flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-gray-500">Saldo Aktif</div>
          <div className="text-3xl font-bold">Rp{saldo}</div>
        </div>
        <button
          className="mt-4 md:mt-0 bg-sky-500 text-white px-6 py-2 rounded-full"
          onClick={menuItems.find((m) => m.key === "topup")?.onClick}
        >
          + Isi Saldo
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-lg font-bold">Rp{totalDeposit}</div>
          <div className="text-gray-500">Total Deposit</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-lg font-bold">{totalTransaksi}</div>
          <div className="text-gray-500">Total Transaksi</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <DashboardMenuCard
            key={item.key}
            label={item.label}
            icon={item.icon}
            onClick={item.key === "logout" ? onLogout : item.onClick}
          />
        ))}
      </div>
      <div className="text-center text-gray-400 mt-8">
        © 2025 <span className="font-bold">JM STORE</span>
      </div>
    </div>
  );
}

DashboardMenuGrid.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  saldo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  totalDeposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  totalTransaksi: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
  onLogout: PropTypes.func.isRequired,
};
