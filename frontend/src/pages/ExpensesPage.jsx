import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from '../api/axios';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    kategori: 'perbaikan',
    deskripsi: '',
    nominal: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(e => {
    const matchSearch = e.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchCat = filterCategory ? e.kategori.toLowerCase() === filterCategory.toLowerCase() : true;
    const matchMonth = filterMonth ? e.bulan.toString() === filterMonth : true;
    return matchSearch && matchCat && matchMonth;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        bulan: parseInt(formData.tanggal.split('-')[1], 10),
        tahun: parseInt(formData.tanggal.split('-')[0], 10),
      };
      
      if (currentExpense) {
        await api.put(`/expenses/${currentExpense.id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Gagal menyimpan data pengeluaran");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah anda yakin ingin menghapus pengeluaran ini?")) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Gagal menghapus pengeluaran");
      }
    }
  };

  const openAddModal = () => {
    setCurrentExpense(null);
    setFormData({
      kategori: 'perbaikan',
      deskripsi: '',
      nominal: '',
      tanggal: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      kategori: expense.kategori,
      deskripsi: expense.deskripsi,
      nominal: expense.nominal,
      tanggal: expense.tanggal,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pengeluaran RT</h2>
          <p className="text-muted-foreground mt-1">
            Pencatatan biaya operasional, gaji, dan perbaikan perumahan.
          </p>
        </div>
        <Button onClick={openAddModal} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari deskripsi pengeluaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Semua Kategori</option>
              <option value="gaji">Gaji</option>
              <option value="perbaikan">Perbaikan</option>
              <option value="operasional">Operasional</option>
            </select>
            
            <select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tanggal</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kategori</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Deskripsi</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nominal</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr><td colSpan="5" className="p-4 text-center">Memuat pengeluaran...</td></tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr><td colSpan="5" className="p-4 text-center">Tidak ada data pengeluaran.</td></tr>
                ) : filteredExpenses.map((e) => (
                  <tr key={e.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{e.tanggal}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground transition-colors capitalize">
                        {e.kategori}
                      </span>
                    </td>
                    <td className="p-4 align-middle">{e.deskripsi || '-'}</td>
                    <td className="p-4 align-middle font-medium text-destructive">
                      - Rp {parseFloat(e.nominal).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(e)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg shadow-lg w-full max-w-md p-6 border">
            <h3 className="text-lg font-semibold mb-4">
              {currentExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal</label>
                <input 
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={e => setFormData({...formData, tanggal: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  required
                  value={formData.kategori}
                  onChange={e => setFormData({...formData, kategori: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="gaji">Gaji</option>
                  <option value="perbaikan">Perbaikan</option>
                  <option value="operasional">Operasional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea 
                  required
                  value={formData.deskripsi}
                  onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nominal (Rp)</label>
                <input 
                  type="number"
                  required
                  min="0"
                  value={formData.nominal}
                  onChange={e => setFormData({...formData, nominal: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
