import { useState, useEffect, useMemo } from "react";
import { Plus, Search, CheckCircle2, DollarSign, CheckSquare, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from '../api/axios';

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function BillingsPage() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState("");

  const [selectedBills, setSelectedBills] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [payingBulk, setPayingBulk] = useState(false);

  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [feeTypesList, setFeeTypesList] = useState([]);
  const [housesList, setHousesList] = useState([]);
  const [advancedForm, setAdvancedForm] = useState({
    house_id: "",
    fee_type_id: "",
    start_month: new Date().getMonth() + 1,
    start_year: new Date().getFullYear(),
    duration: 12
  });
  const [processingAdvanced, setProcessingAdvanced] = useState(false);

  useEffect(() => {
    fetchBillings();
    fetchAdvancedData();
  }, []);

  const fetchAdvancedData = async () => {
    try {
      const [feeRes, housesRes] = await Promise.all([
        api.get('/fee-types'),
        api.get('/houses')
      ]);
      setFeeTypesList(feeRes.data);
      // Only keep occupied houses that actually have an active resident
      setHousesList(housesRes.data.filter(h => 
        h.status === 'dihuni' && 
        h.residents && 
        h.residents.some(r => r.pivot?.is_active === 1 || r.pivot?.is_active === true)
      ));
    } catch (error) {
      console.error("Error fetching data for advanced billing", error);
    }
  };

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/billings');
      setBillings(response.data);
    } catch (error) {
      console.error("Error fetching billings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await api.put(`/billings/${id}`, { status: 'lunas' });
      toast.success("Tagihan berhasil dilunasi");
      fetchBillings();
    } catch (error) {
      console.error("Error paying billing:", error);
      toast.error("Gagal mengubah status tagihan");
    }
  };

  const handleCancelPay = async (id) => {
    try {
      await api.put(`/billings/${id}`, { status: 'belum_bayar' });
      toast.success("Status lunas berhasil dibatalkan");
      fetchBillings();
    } catch (error) {
      console.error("Error canceling payment:", error);
      toast.error("Gagal membatalkan status lunas");
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/billings/generate');
      toast.success(response.data.message || "Tagihan bulan ini berhasil digenerate");
      fetchBillings();
    } catch (error) {
      console.error("Error generating billings:", error);
      toast.error("Gagal generate tagihan");
    } finally {
      setGenerating(false);
    }
  };

  const handleAdvancedSubmit = async (e) => {
    e.preventDefault();
    if (!advancedForm.house_id || !advancedForm.fee_type_id) {
      toast.error("Harap lengkapi rumah dan jenis iuran.");
      return;
    }
    
    // get selected house
    const house = housesList.find(h => h.id === parseInt(advancedForm.house_id));
    const resident = house?.residents?.find(r => r.pivot?.is_active === 1 || r.pivot?.is_active === true);
    
    if (!resident) {
      toast.error("Rumah ini tidak memiliki penghuni aktif.");
      return;
    }

    const feeType = feeTypesList.find(f => f.id === parseInt(advancedForm.fee_type_id));
    if (!feeType) return;

    setProcessingAdvanced(true);
    let startMonth = parseInt(advancedForm.start_month);
    let startYear = parseInt(advancedForm.start_year);
    let duration = parseInt(advancedForm.duration);

    try {
      const promises = [];
      for (let i = 0; i < duration; i++) {
        let currentMonth = startMonth + i;
        let currentYear = startYear;
        
        while (currentMonth > 12) {
          currentMonth -= 12;
          currentYear += 1;
        }

        promises.push(api.post('/billings', {
          house_id: house.id,
          resident_id: resident.id,
          fee_type_id: feeType.id,
          bulan: currentMonth,
          tahun: currentYear,
          nominal: feeType.nominal,
          status: 'lunas'
        }));
      }

      await Promise.all(promises);
      toast.success(`Berhasil membuat tagihan untuk ${duration} bulan.`);
      setIsAdvancedModalOpen(false);
      fetchBillings();
    } catch (error) {
      console.error("Error creating advanced bills:", error);
      toast.error("Gagal membuat beberapa tagihan. Mungkin tagihan sudah ada.");
    } finally {
      setProcessingAdvanced(false);
    }
  };

  const handleBulkPay = async () => {
    if (selectedBills.length === 0) return;
    try {
      setPayingBulk(true);
      const response = await api.post('/billings/bulk-pay', { billing_ids: selectedBills });
      toast.success(response.data.message || "Bulk payment berhasil");
      setSelectedBills([]);
      fetchBillings();
    } catch (error) {
      console.error("Error bulk paying:", error);
      toast.error("Gagal melakukan pembayaran bulk");
    } finally {
      setPayingBulk(false);
    }
  };

  const [activeTab, setActiveTab] = useState("Semua");

  const toggleSelectAll = () => {
    if (selectedBills.length === filteredBillings.filter(b => b.status !== 'lunas').length && selectedBills.length > 0) {
      setSelectedBills([]);
    } else {
      setSelectedBills(filteredBillings.filter(b => b.status !== 'lunas').map(b => b.id));
    }
  };

  const toggleSelectBill = (id) => {
    if (selectedBills.includes(id)) {
      setSelectedBills(selectedBills.filter(billId => billId !== id));
    } else {
      setSelectedBills([...selectedBills, id]);
    }
  };

  const filteredBillings = useMemo(() => {
    return billings.filter(b => {
      const matchSearch = searchTerm === "" || 
        b.house?.nomor_rumah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.resident?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchMonth = filterMonth === "" || b.bulan.toString() === filterMonth;
      const matchYear = filterYear === "" || b.tahun.toString() === filterYear;
      
      let mappedStatus = filterStatus;
      if (filterStatus === "Lunas") mappedStatus = "lunas";
      if (filterStatus === "Belum Bayar") mappedStatus = "belum_bayar";
      const matchStatus = filterStatus === "" || b.status === mappedStatus;
      
      const matchTab = activeTab === "Semua" || b.fee_type?.nama === activeTab;

      return matchSearch && matchMonth && matchYear && matchStatus && matchTab;
    });
  }, [billings, searchTerm, filterMonth, filterYear, filterStatus, activeTab]);

  // Generate years options dynamically based on current year +/- 5
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // Get unique fee types for tabs
  const feeTypes = ["Semua", ...new Set(billings.map(b => b.fee_type?.nama).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tagihan Iuran</h2>
          <p className="text-muted-foreground mt-1">
            Kelola tagihan iuran warga, status pembayaran, dan penerimaan dana.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" className="bg-background border-primary text-primary hover:bg-primary/10" onClick={() => setIsAdvancedModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Bayar Advanced (Custom)
          </Button>
          <Button variant="outline" className="bg-background" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate Tagihan Bulan Ini"}
          </Button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90" 
            onClick={handleBulkPay} 
            disabled={selectedBills.length === 0 || payingBulk}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Pembayaran Bulk ({selectedBills.length})
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="border-b px-4">
          <div className="flex space-x-4 overflow-x-auto">
            {feeTypes.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedBills([]); }}
                className={`py-4 px-2 relative font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nomor rumah atau penghuni..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{monthNames[month - 1]}</option>
              ))}
            </select>
            
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Semua Tahun</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Bayar">Belum Bayar</option>
            </select>
          </div>
          
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedBills.length > 0 && selectedBills.length === filteredBillings.filter(b => b.status !== 'lunas').length}
                      onChange={toggleSelectAll}
                      disabled={filteredBillings.filter(b => b.status !== 'lunas').length === 0}
                    />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rumah</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Penghuni</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Jenis</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Periode</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nominal</th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr><td colSpan="8" className="p-4 text-center">Memuat tagihan...</td></tr>
                ) : filteredBillings.length === 0 ? (
                  <tr><td colSpan="8" className="p-4 text-center text-muted-foreground">Tidak ada data tagihan</td></tr>
                ) : filteredBillings.map((b) => (
                  <tr key={b.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      {b.status !== 'lunas' && (
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                          checked={selectedBills.includes(b.id)}
                          onChange={() => toggleSelectBill(b.id)}
                        />
                      )}
                    </td>
                    <td className="p-4 align-middle font-medium">{b.house?.nomor_rumah || '-'}</td>
                    <td className="p-4 align-middle">{b.resident?.nama_lengkap || '-'}</td>
                    <td className="p-4 align-middle">{b.fee_type?.nama || '-'}</td>
                    <td className="p-4 align-middle">{monthNames[b.bulan - 1]} {b.tahun}</td>
                    <td className="p-4 align-middle">Rp {parseFloat(b.nominal).toLocaleString('id-ID')}</td>
                    <td className="p-4 align-middle text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                        b.status === 'lunas' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {b.status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      {b.status !== 'lunas' ? (
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handlePay(b.id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                          Tandai Lunas
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancelPay(b.id)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Batalkan Lunas
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAdvancedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Bayar Iuran Advanced</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Buat beberapa tagihan sekaligus untuk penghuni yang ingin membayar beberapa bulan di awal.
            </p>
            <form onSubmit={handleAdvancedSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rumah (Dihuni)</label>
                <select 
                  required
                  value={advancedForm.house_id}
                  onChange={(e) => setAdvancedForm({...advancedForm, house_id: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">-- Pilih Rumah --</option>
                  {housesList.map(h => (
                    <option key={h.id} value={h.id}>{h.nomor_rumah}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Jenis Iuran</label>
                <select 
                  required
                  value={advancedForm.fee_type_id}
                  onChange={(e) => setAdvancedForm({...advancedForm, fee_type_id: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">-- Pilih Iuran --</option>
                  {feeTypesList.map(f => (
                    <option key={f.id} value={f.id}>{f.nama} (Rp {parseFloat(f.nominal).toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mulai Bulan</label>
                  <select 
                    value={advancedForm.start_month}
                    onChange={(e) => setAdvancedForm({...advancedForm, start_month: e.target.value})}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{monthNames[m - 1]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tahun</label>
                  <select 
                    value={advancedForm.start_year}
                    onChange={(e) => setAdvancedForm({...advancedForm, start_year: e.target.value})}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Durasi (Bulan)</label>
                <input 
                  type="number" 
                  min="1"
                  max="24"
                  required
                  value={advancedForm.duration}
                  onChange={(e) => setAdvancedForm({...advancedForm, duration: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Misal: 12 untuk 1 tahun.</p>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAdvancedModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={processingAdvanced}>
                  {processingAdvanced ? "Memproses..." : "Buat Tagihan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

