import { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../common/SearchBar';
import Pagination from '../../common/Pagination';
import useToast from '../../../hooks/useToast';

// Area data
const areaData = [
  { provinsi: 'Banten', kota: 'Kota Tangerang Selatan, Kota Tangerang, Kab. Tangerang, Kab. Pandeglang, Kab. Lebak, Kab. Serang, Kota Serang, Kota Cilegon', area: 'Area 2' },
  { provinsi: 'DI Yogyakarta', kota: 'Kab. Kulon Progo, Kota Yogyakarta, Kab. Sleman', area: 'Area 1' },
  { provinsi: 'DKI Jakarta', kota: 'Kota Jakarta Pusat, Kota Jakarta Selatan', area: 'Area 2' },
  { provinsi: 'Jawa Barat', kota: 'Kab. Bandung, Kab. Kuningan, Kab. Purwakarta', area: 'Area 1' },
  { provinsi: 'Jawa Barat', kota: 'Kab. Bandung Barat, Kota Cimahi, Kab. Cirebon, Kota Cirebon, Kab. Indramayu, Kab. Subang', area: 'Area 2' },
  { provinsi: 'Jawa Barat', kota: 'Kab. Bogor, Kota Bogor, Kota Depok, Kota Bekasi, Kota Banjar, Kab. Ciamis, Kota Tasikmalaya, Kab. Majalengka, Kab. Sumedang, Kab. Bekasi, Kab. Tasikmalaya, Kab. Garut', area: 'Area 3' },
  { provinsi: 'Jawa Barat', kota: 'Kab. Cianjur, Kab. Pangandaran, Kab. Karawang, Kota Sukabumi, Kab. Sukabumi', area: 'Area 4' },
  { provinsi: 'Jawa Tengah', kota: 'Kab. Tegal, Kota Surakarta, Kota Tegal, Kab. Brebes, Kab. Kebumen, Kab. Pemalang, Kota Semarang', area: 'Area 2' },
  { provinsi: 'Jawa Tengah', kota: 'Kab. Boyolali, Kota Salatiga, Kab. Semarang, Kab. Cilacap, Kab. Grobogan, Kab. Kendal, Kab. Rembang', area: 'Area 3' },
  { provinsi: 'Jawa Tengah', kota: 'Kota Pekalongan, Kab. Pekalongan, Kab. Batang, Kab. Purbalingga, Kab. Kudus, Kab. Sukoharjo, Kab. Klaten, Kota Magelang, Kab. Banyumas, Kab. Banyumas, Kab. Magelang, Kab. Temanggung, Kab. Sragen, Kab. Banjarnegara, Kab. Karanganyar, Kab. Wonosobo, Kab. Jepara, Kab. Demak, Kab. Purworejo, Kab. Blora, Kab. Wonogiri, Kab. Pati', area: 'Area 4' },
  { provinsi: 'Jawa Timur', kota: 'Kota Probolinggo, Kab. Bangkalan, Kab. Sidoarjo, Kab. Banyuwangi, Kota Surabaya, Kab. Sampang, Kab. Pamekasan, Kab. Sumenep, Kab. Pacitan', area: 'Area 2' },
  { provinsi: 'Jawa Timur', kota: 'Kab. Lumajang, Kab. Probolinggo', area: 'Area 3' },
  { provinsi: 'Jawa Timur', kota: 'Kab. Jombang, Kota Blitar, Kab. Blitar, Kota Kediri, Kab. Lamongan, Kab. Kediri, Kab. Ngawi, Kab. Mojokerto, Kota Mojokerto, Kab. Magetan, Kab. Gresik, Kab. Tulungagung, Kab. Nganjuk, Kab. Pasuruan, Kota Pasuruan, Kab. Bojonegoro, Kab. Madiun, Kab. Bondowoso, Kab. Tuban, Kota Madiun, Kab. Situbondo, Kab. Jember, Kota Malang, Kab. Malang, Kab. Ponorogo, Kota Batu, Kab. Trenggalek', area: 'Area 4' },
  { provinsi: 'Bengkulu', kota: 'Kab. Seluma', area: 'Area 3' },
  { provinsi: 'Jawa Bengkulu', kota: 'Kab. Bengkulu Selatan, Kab. Kaur, Kab. Lebong, Kab. Rejang Lebong, Kab. Bengkulu Tengah, Kota Bengkulu, Kab. Bengkulu Utara, Kab. Kepahiang, Kab. Muko Muko', area: 'Area 4' },
  { provinsi: 'Jambi', kota: 'Kab. Batanghari, Kota Jambi, Kab. Tanjung Jabung Barat, Kab. Muaro Jambi, Kab. Sarolangun', area: 'Area 3' },
  { provinsi: 'Jambi', kota: 'Kab. Tanjung Jabung Timur, Kab. Kerinci, Kab. Bungo, Kab. Tebo, Kab. Merangin, Kota Sungai Penuh', area: 'Area 4' },
  { provinsi: 'Kepulauan Bangka Belitung', kota: 'Kab. Bangka Selatan, Kota Pangkal Pinang, Kab. Belitung, Kab. Belitung Timur', area: 'Area 2' },
  { provinsi: 'Kepulauan Bangka Belitung', kota: 'Kab. Bangka, Kab. Bangka Tengah, Kab. Bangka Barat', area: 'Area 3' },
  { provinsi: 'Kepulauan Riau', kota: 'Kota. Batam', area: 'Area 2' },
  { provinsi: 'Kepulauan Riau', kota: 'Kab. Karimun, Kab. Bintan, Kota Tanjung Pinang', area: 'Area 3' },
  { provinsi: 'Kepulauan Riau', kota: 'Kab. Lingga, Kab. Kepulauan Anambas, Kab. Natuna', area: 'Area 4' },
  { provinsi: 'Lampung', kota: 'Kab. Lampung Tengah, Kab. Pringsewu, Kota Metro, Kab. Pesawaran, Kab. Lampung Selatan, Kota Bandar Lampung', area: 'Area 3' },
  { provinsi: 'Lampung', kota: 'Kab. Lampung Barat, Kab. Lampung Timur, Kab. Tulang Bawang Barat, Kab. Way Kanan, Kab. Tulang Bawang, Kab. Tanggamus, Kab. Pesisir Barat, Kab. Lampung Utara, Kab. Mesuji', area: 'Area 4' },
  { provinsi: 'Nanggroe Aceh Darussalam', kota: 'Kab. Aceh Barat Daya, Kab. Aceh Besar, Kota Sabang, Kab. Gayo Lues', area: 'Area 2' },
  { provinsi: 'Nanggroe Aceh Darussalam', kota: 'Kab. Aceh Jaya, Kab. Aceh Selatan, Kab. Aceh Tenggara, Kab. Nagan Raya, Kota Banda Aceh', area: 'Area 3' },
  { provinsi: 'Nanggroe Aceh Darussalam', kota: 'Kab. Aceh Barat, Kab. Aceh Singkil, Kab. Aceh Tamiang, Kab. Aceh Tengah, Kota Subulussalam, Kab. Bener Meriah, Kab. Aceh Utara, Kota Lhokseumawe, Kab. Pidie, Kab. Aceh Timur, Kab. Simeulue, Kota Langsa, Kab. Bireuen, Kab. Pidie Jaya', area: 'Area 4' },
  { provinsi: 'Riau', kota: 'Kota Pekanbaru', area: 'Area 2' },
  { provinsi: 'Riau', kota: 'Kab. Kuantan Singingi, Kab. Pelalawan, Kab. Kampar, Kab. Siak, Kota Dumai, Kab. Rokan Hilir, Kab. Indragiri Hulu, Kab. Kepulauan Meranti, Kab. Bengkalis', area: 'Area 3' },
  { provinsi: 'Riau', kota: 'Kab. Rokan Hulu, Kab. Indragiri Hilir', area: 'Area 4' },
  { provinsi: 'Sumatera Barat', kota: 'Kab. Kepulauan Mentawai', area: 'Area 2' },
  { provinsi: 'Sumatera Barat', kota: 'Kota Payakumbuh, Kota Padang Panjang, Kab. Sijunjung, Kab. Padang Pariaman, Kota Padang, Kab. Solok Selatan', area: 'Area 3' },
  { provinsi: 'Sumatera Barat', kota: 'Kab. Pasaman Barat, Kab. Pasaman, Kab. Lima Puluh Kota, Kab. Tanah Datar, Kab. Dharmasraya, Kota Solok, Kab. Agam, Kab. Solok, Kota Bukittinggi, Kota Pariaman, Kota Sawahlunto, Kab. Pesisir Selatan', area: 'Area 4' },
  { provinsi: 'Sumatera Selatan', kota: 'Kab. Ogan Komering Ilir, Kab. Penukal Abab Lematang Ilir, Kab. Banyuasin, Kota Palembang, Kab. Ogan Ilir', area: 'Area 3' },
  { provinsi: 'Sumatera Selatan', kota: 'Kab. Ogan Komering Ulu Timur, Kab. Ogan Komering Ulu Selatan, Kab. Ogan Komering Ulu, Kab. Musi Rawas, Kab. Musi Rawas Utara, Kab. Empat Lawang, Kota Pagar Alam, Kota Lubuk Linggau, Kab. Musi Banyuasin, Kab. Muara Enim, Kab. Lahat, Kota Prabumulih', area: 'Area 4' },
  { provinsi: 'Sumatera Utara', kota: 'Kab. Karo, Kota Medan, Kab. Dairi', area: 'Area 2' },
  { provinsi: 'Sumatera Utara', kota: 'Kota Binjai, Kota Tebing Tinggi, Kab. Serdang Bedagai, Kab. Langkat, Kab. Deli Serdang, Kab. Batu Bara, Kota Tanjung Balai, Kab. Asahan, Kota Gunungsitoli, Kab. Nias Barat, Kab. Nias Selatan, Kab. Nias Utara', area: 'Area 3' },
  { provinsi: 'Sumatera Utara', kota: 'Kab. Pakpak Bharat, Kab. Mandailing Natal, Kab. Padang Lawas, Kab. Labuhanbatu Utara, Kota Padangsidimpuan, Kab. Tapanuli Selatan, Kab. Labuhanbatu Selatan, Kab. Labuhanbatu, Kab. Tapanuli Utara, Kab. Padang Lawas Utara, Kab. Humbang Hasundutan, Kab. Simalungun, Kab. Toba Samosir, Kota Pematangsiantar, Kab. Tapanuli Tengah, Kab. Samosir, Kota Sibolga, Kab. Nias', area: 'Area 4' },
  { provinsi: 'Kalimantan Barat', kota: 'Kab. Sekadau, Kab. Kapuas Hulu, Kab. Sintang, Kab. Bengkayang, Kab. Melawi, Kab. Sambas, Kab. Sanggau, Kab. Kubu Raya, Kota Pontianak, Kab. Kayong Utara, Kab. Landak, Kab. Mempawah, Kota Singkawang, Kab. Ketapang', area: 'Area 4' },
  { provinsi: 'Kalimantan Selatan', kota: 'Kab. Hulu Sungai Tengah, Kab. Tapin, Kab. Hulu Sungai Utara, Kab. Tabalong, Kota Banjarmasin, Kab. Banjar, Kab. Tanah Bumbu, Kota Banjarbaru, Kab. Hulu Sungai Selatan', area: 'Area 2' },
  { provinsi: 'Kalimantan Selatan', kota: 'Kab. Balangan, Kab. Barito Kuala, Kab. Tanah Laut, Kab. Kotabaru', area: 'Area 3' },
  { provinsi: 'Kalimantan Tengah', kota: 'Kab. Kapuas, Kab. Pulang Pisau, Kota Palangkaraya', area: 'Area 3' },
  { provinsi: 'Kalimantan Tengah', kota: 'Kab. Seruyan, Kab. Kotawaringin Barat, Kab. Katingan, Kab. Kotawaringin Timur, Kab. Sukamara, Kab. Lamandau, Kab. Murung Raya, Kab. Barito Timur, Kab. Barito Utara, Kab. Barito Selatan, Kab. Gunung Mas', area: 'Area 4' },
  { provinsi: 'Kalimantan Timur', kota: 'Kab. Penajam Paser Utara, Kota Balikpapan, Kab. Paser, Kab. Kutai Kartanegara, Kota Samarinda, Kota Bontang, Kab. Berau, Kab. Kutai Timur, Kab. Kutai Barat, Kab. Mahakam Ulu', area: 'Area 4' },
  { provinsi: 'Kalimantan Utara', kota: 'Kab. Tana Tidung, Kab. Malinau, Kab. Bulungan, Kota Tarakan, Kab. Nunukan', area: 'Area 4' },
  { provinsi: 'Gorontalo', kota: 'Kab. Pahuwato, Kab. Boalemo, Kab. Gorontalo, Kota Gorontalo, Kab. Gorontalo Utara, Kab. Bone Bolango', area: 'Area 4' },
  { provinsi: 'Sulawesi Barat', kota: 'Kab. Mamuju Tengah', area: 'Area 2' },
  { provinsi: 'Sulawesi Barat', kota: 'Kab. Majene, Kab. Polewali Mandar, Kab. Mamuju Utara', area: 'Area 3' },
  { provinsi: 'Sulawesi Barat', kota: 'Kab. Mamuju, Kab. Mamasa', area: 'Area 4' },
  { provinsi: 'Sulawesi Selatan', kota: 'Kab. Barru, Kota Pare Pare, Kab. Pinrang', area: 'Area 2' },
  { provinsi: 'Sulawesi Selatan', kota: 'Kab. Sinjai, Kab. Enrekang, Kab. Sidenreng Rappang, Kab. Luwu Timur, Kab. Soppeng, Kab. Tana Toraja', area: 'Area 3' },
  { provinsi: 'Sulawesi Selatan', kota: 'Kab. Kepulauan Selayar, Kab. Takalar, Kab. Jeneponto, Kab. Bulukumba, Kab. Pangkajene Kepulauan, Kota Makassar, Kab. Gowa, Kab. Maros, Kab. Bone, Kab. Wajo, Kab. Luwu, Kab. Luwu Utara, Kota Palopo, Kab. Toraja Utara', area: 'Area 4' },
  { provinsi: 'Sulawesi Tengah', kota: 'Kab. Banggai Kepulauan, Kab. Banggai Laut, Kota Palu, Kab. Toli Toli, Kab. Tojo Una Una, Kab. Morowali, Kab. Morowali Utara', area: 'Area 3' },
  { provinsi: 'Sulawesi Tengah', kota: 'Kab. Banggai, Kab. Parigi Moutong, Kab. Donggala, Kab. Sigi, Kab. Poso, Kab. Buol', area: 'Area 4' },
  { provinsi: 'Sulawesi Tenggara', kota: 'Kab. Konawe Kepulauan, Kab. Konawe Utara, Kab. Buton Utara, Kab. Wakatobi', area: 'Area 2' },
  { provinsi: 'Sulawesi Tenggara', kota: 'Kota Bau Bau, Kab. Muna, Kab. Buton Selatan, Kab. Buton Tengah, Kab. Muna Barat', area: 'Area 3' },
  { provinsi: 'Sulawesi Tenggara', kota: 'Kab. Kolaka, Kab. Kolaka Utara, Kab. Konawe, Kab. Konawe Selatan, Kota Kendari, Kab. Kolaka Timur, Kab. Buton, Kab. Bombana', area: 'Area 4' },
  { provinsi: 'Sulawesi Utara', kota: 'Kab. Bolaang Mongondow, Kab. Bolaang Mongondow Selatan, Kota Kotamobagu, Kab. Minahasa Selatan, Kab. Bolaang Mongondow Timur, Kab. Minahasa Tenggara, Kab. Bolaang Mongondow Utara, Kota Tomohon, Kab. Minahasa, Kota Manado, Kab. Minahasa Utara, Kota Bitung, Kab. Kepulauan Sangihe, Kab. Kepulauan Talaud, Kab. Siau Tagulandang Biaro', area: 'Area 4' },
  { provinsi: 'Bali', kota: 'Kab. Jembrana, Kab. Buleleng', area: 'Area 1' },
  { provinsi: 'Bali', kota: 'Kab. Badung, Kab. Karangasem, Kab. Tabanan, Kab. Bangli, Kab. Gianyar, Kab. Klungkung, Kota Denpasar', area: 'Area 2' },
  { provinsi: 'Nusa Tenggara Barat', kota: 'Kab. Lombok Barat, Kab. Lombok Timur, Kota Mataram, Kab. Lombok Tengah, Kab. Lombok Utara, Kab. Sumbawa Barat, Kab. Sumbawa, Kota Bima, Kab. Dompu', area: 'Area 2' },
  { provinsi: 'Nusa Tenggara Barat', kota: 'Kab. Bima', area: 'Area 4' },
  { provinsi: 'Nusa Tenggara Timur', kota: 'Kab. Alor, Kota Kupang, Kab. Kupang, Kab. Malaka, Kab. Manggarai Barat, Kab. Timor Tengah Selatan, Kab. Belu, Kab. Sikka, Kab. Timor Tengah Utara, Kab. Lembata, Kab. Manggarai Timur, Kab. Ende, Kab. Sumba Barat Daya, Kab. Rote Ndao, Kab. Nagekeo, Kab. Flores Timur, Kab. Ngada, Kab. Sumba Tengah, Kab. Manggarai, Kab. Sumba Barat, Kab. Sumba Timur, Kab. Sabu Raijua', area: 'Area 4' },
  { provinsi: 'Maluku', kota: 'Kab. Maluku Tenggara Barat, Kab. Kepulauan Aru, Kota Tual, Kab. Seram Bagian Barat, Kab. Maluku Tengah, Kab. Seram Bagian Timur, Kota Ambon, Kab. Maluku Tenggara, Kab. Maluku Barat Daya, Kab. Buru Selatan, Kab. Buru', area: 'Area 1' },
  { provinsi: 'Maluku Utara', kota: 'Kab. Halmahera Barat, Kab. Halmahera Utara, Kab. Kepulauan Sula, Kab. Halmahera Timur, Kab. Pulau Taliabu, Kab. Halmahera Selatan, Kota Tidore Kepulauan, Kota Ternate, Kab. Halmahera Tengah, Kab. Pulau Morotai', area: 'Area 1' },
  { provinsi: 'Papua', kota: 'Kab. Asmat, Kab. Jayapura, Kab. Mimika, Kab. Keerom, Kab. Biak Numfor, Kota Jayapura, Kab. Kepulauan Yapen, Kab. Boven Digoel, Kab. Merauke, Kab. Deiyai, Kab. Dogiyai, Kab. Intan Jaya, Kab. Jayawijaya, Kab. Lanny Jaya, Kab. Mamberamo Raya, Kab. Mamberamo Tengah, Kab. Mappi, Kab. Nabire, Kab. Nduga, Kab. Paniai, Kab. Pegunungan Bintang, Kab. Puncak, Kab. Puncak Jaya, Kab. Sarmi, Kab. Supiori, Kab. Tolikara, Kab. Waropen, Kab. Yahukimo, Kab. Yalimo', area: 'Area 1' },
  { provinsi: 'Papua Barat', kota: 'Kab. Teluk Bintuni, Kab. Sorong Selatan, Kab. Sorong, Kab. Teluk Wondama, Kota Sorong, Kab. Manokwari, Kab. Fak Fak, Kab. Kaimana, Kab. Manokwari Selatan, Kab. Maybrat, Kab. Pegunungan Arfak, Kab. Raja Ampat, Kab. Tambrauw', area: 'Area 1' }
];

export default function BuyPackage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [filteredAreaData, setFilteredAreaData] = useState(areaData);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    provider: ''
  });

  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    fetchPackages();
    fetchBalance();
  }, [filters, pagination.currentPage]);

  // Filter area data based on search
  useEffect(() => {
    if (!areaSearch.trim()) {
      setFilteredAreaData(areaData);
    } else {
      const filtered = areaData.filter(item => 
        item.provinsi.toLowerCase().includes(areaSearch.toLowerCase()) ||
        item.kota.toLowerCase().includes(areaSearch.toLowerCase()) ||
        item.area.toLowerCase().includes(areaSearch.toLowerCase())
      );
      setFilteredAreaData(filtered);
    }
  }, [areaSearch]);

  const fetchPackages = async () => {
    try {
      const params = { 
        ...filters,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      const response = await axios.get('https://api-inventory.isavralabel.com/api/jmstore/user/packages', { params });
      setPackages(response.data.data || response.data);
      
      // Handle pagination data if available
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      } else {
        // If no pagination data from API, create basic pagination
        const totalItems = response.data.length || 0;
        setPagination(prev => ({
          ...prev,
          totalItems,
          totalPages: Math.ceil(totalItems / pagination.itemsPerPage)
        }));
      }
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

  const fetchStock = async () => {
    setStockLoading(true);
    try {
      const res = await fetch('https://panel.khfy-store.com/api/api-xl-v7/cek_stock_akrab');
      const response = await res.json();
      setStockData(response);
      setShowStockModal(true);
    } catch (error) {
      console.error('Error fetching stock:', error);
      showError('Gagal memuat informasi stok');
    } finally {
      setStockLoading(false);
    }
  };



  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
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

  const formatStockMessage = (message) => {
    if (!message) return [];
    
    return message.split('\n').filter(line => line.trim()).map((line, index) => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const packageName = parts[0].trim();
        const stockInfo = parts[1].trim();
        const isAvailable = stockInfo.includes('tersedia') && !stockInfo.startsWith('0');
        
        return {
          id: index,
          name: packageName,
          stock: stockInfo,
          available: isAvailable
        };
      }
      return null;
    }).filter(item => item !== null);
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
        <div className="flex md:flex-row flex-col gap-3 items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Saldo Saat Ini</p>
            <p className="text-xl font-semibold text-gray-900">Rp {Math.floor(balance || 0).toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAreaModal(true)}
              className="btn btn-secondary"
            >
              Cek Area
            </button>
            <button
              onClick={fetchStock}
              disabled={stockLoading}
              className="btn btn-secondary"
            >
              {stockLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cek Stock...
                </div>
              ) : (
                'Cek Stock'
              )}
            </button>
            {/* <button
              onClick={checkPackage}
              disabled={packageCheckLoading || !phoneNumber.trim()}
              className="btn btn-secondary"
            >
              {packageCheckLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cek Paket...
                </div>
              ) : (
                'Cek Paket'
              )}
            </button> */}
            <a href="/user/topup" className="btn btn-primary">
              Isi Saldo
            </a>
          </div>
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

      {/* Packages Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-gray-500">{pkg.denomination}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(pkg.type)}`}>
                      {pkg.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pkg.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Rp {pkg.display_price?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pkg.status)}`}>
                      {pkg.status === 'active' ? 'Tersedia' : 'Tidak Tersedia'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowPurchaseModal(true);
                      }}
                      disabled={pkg.status !== 'active' || pkg.display_price > balance || !phoneNumber.trim()}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        pkg.status === 'active' && pkg.display_price <= balance && phoneNumber.trim()
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {!phoneNumber.trim() ? 'Masukkan Nomor Telepon' : 
                       pkg.display_price > balance ? 'Saldo Tidak Cukup' : 'Beli'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Informasi Stok XL</h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {stockData && (
                <div className="space-y-3">
                  {formatStockMessage(stockData.message).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${
                        item.available
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.stock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStockModal(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Area Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cek Area Akrab</h3>
              <button
                onClick={() => {
                  setShowAreaModal(false);
                  setAreaSearch('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                placeholder="Cari provinsi, kota, atau area..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Area Table */}
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Provinsi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Kota/Kabupaten
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Area
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAreaData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {item.provinsi}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-b">
                        {item.kota}
                      </td>
                      <td className="px-4 py-3 text-sm border-b">
                        <div className={`px-2 py-1 text-xs rounded-full w-14 ${
                          item.area === 'Area 1' ? 'bg-green-100 text-green-800' :
                          item.area === 'Area 2' ? 'bg-blue-100 text-blue-800' :
                          item.area === 'Area 3' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.area}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Total: {filteredAreaData.length} area ditemukan
              </div>
              <button
                onClick={() => {
                  setShowAreaModal(false);
                  setAreaSearch('');
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}