import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from '../api/axios';

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingKtp, setViewingKtp] = useState(null);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    alamat: '',
    status_penghuni: 'tetap',
    nomor_telepon: '',
    sudah_menikah: false,
    foto_ktp: null
  });
  const [editFormData, setEditFormData] = useState({
    nama_lengkap: '',
    alamat: '',
    status_penghuni: 'tetap',
    nomor_telepon: '',
    sudah_menikah: false,
    foto_ktp: null
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('active');

  const fetchResidents = async () => {
    setLoading(true);
    try {
      let url = '/residents';
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      const response = await api.get(url);
      setResidents(response.data);
    } catch (error) {
      console.error("Error fetching residents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [filterStatus]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (typeof formData[key] === 'boolean') {
            payload.append(key, formData[key] ? 1 : 0);
          } else {
            payload.append(key, formData[key]);
          }
        }
      });
      await api.post('/residents', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsAddModalOpen(false);
      setFormData({
        nama_lengkap: '',
        alamat: '',
        status_penghuni: 'tetap',
        nomor_telepon: '',
        sudah_menikah: false,
        foto_ktp: null
      });
      fetchResidents();
    } catch (error) {
      console.error("Error adding resident:", error);
    }
  };

  const handleEditClick = (resident) => {
    setEditingId(resident.id);
    setEditFormData({
      nama_lengkap: resident.nama_lengkap,
      alamat: resident.alamat || '',
      status_penghuni: resident.status_penghuni,
      nomor_telepon: resident.nomor_telepon,
      sudah_menikah: Boolean(resident.sudah_menikah),
      foto_ktp: null
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key] !== null && editFormData[key] !== undefined) {
          if (typeof editFormData[key] === 'boolean') {
            payload.append(key, editFormData[key] ? 1 : 0);
          } else {
            payload.append(key, editFormData[key]);
          }
        }
      });
      payload.append('_method', 'PUT');
      await api.post(`/residents/${editingId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchResidents();
    } catch (error) {
      console.error("Error editing resident:", error);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus penghuni ini?')) {
      try {
        await api.delete(`/residents/${id}`);
        fetchResidents();
      } catch (error) {
        console.error("Error deleting resident:", error);
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResidents = [...residents].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredResidents = sortedResidents.filter(r => {
    const term = searchTerm.toLowerCase();
    return r.nama_lengkap.toLowerCase().includes(term) ||
      (r.nomor_telepon && r.nomor_telepon.toLowerCase().includes(term)) ||
      (r.alamat && r.alamat.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Penghuni</h2>
          <p className="text-muted-foreground mt-1">
            Kelola data warga perumahan, status, dan informasi kontak.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Penghuni
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama atau no. telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 w-full sm:w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Semua Penghuni</option>
              <option value="active">Penghuni Aktif</option>
              <option value="inactive">Penghuni Lama</option>
            </select>
          </div>

          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort('nama_lengkap')}
                  >
                    <div className="flex items-center gap-1">
                      Nama Lengkap
                      {sortConfig.key === 'nama_lengkap' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-50" />}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Alamat</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Foto KTP</th>
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort('status_penghuni')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortConfig.key === 'status_penghuni' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-50" />}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Telepon</th>
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort('sudah_menikah')}
                  >
                    <div className="flex items-center gap-1">
                      Status Nikah
                      {sortConfig.key === 'sudah_menikah' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-50" />}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr><td colSpan="7" className="p-4 text-center">Memuat data...</td></tr>
                ) : filteredResidents.map((r) => (
                  <tr key={r.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{r.nama_lengkap}</td>
                    <td className="p-4 align-middle">{r.alamat || '-'}</td>
                    <td className="p-4 align-middle">
                      {r.foto_ktp ? (
                        <button 
                          onClick={() => setViewingKtp(r.foto_ktp)}
                          className="text-blue-500 hover:underline text-left"
                        >
                          Lihat
                        </button>
                      ) : '-'}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${r.status_penghuni === 'tetap'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                        {r.status_penghuni}
                      </span>
                    </td>
                    <td className="p-4 align-middle">{r.nomor_telepon}</td>
                    <td className="p-4 align-middle">{r.sudah_menikah ? "Menikah" : "Belum Menikah"}</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(r)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(r.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredResidents.length === 0 && !loading && (
                  <tr><td colSpan="7" className="p-4 text-center">Data tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Tambah Penghuni</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alamat</label>
                <input
                  type="text"
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foto KTP</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, foto_ktp: e.target.files[0] })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status Penghuni</label>
                <select
                  value={formData.status_penghuni}
                  onChange={(e) => setFormData({ ...formData, status_penghuni: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                >
                  <option value="tetap">Tetap</option>
                  <option value="kontrak">Kontrak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">No. Telepon</label>
                <input
                  type="text"
                  required
                  value={formData.nomor_telepon}
                  onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sudah_menikah"
                  checked={formData.sudah_menikah}
                  onChange={(e) => setFormData({ ...formData, sudah_menikah: e.target.checked })}
                />
                <label htmlFor="sudah_menikah" className="text-sm font-medium">Sudah Menikah</label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
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

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Penghuni</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editFormData.nama_lengkap}
                  onChange={(e) => setEditFormData({ ...editFormData, nama_lengkap: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alamat</label>
                <input
                  type="text"
                  required
                  value={editFormData.alamat}
                  onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foto KTP</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditFormData({ ...editFormData, foto_ktp: e.target.files[0] })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Pilih file baru jika ingin mengganti KTP.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status Penghuni</label>
                <select
                  value={editFormData.status_penghuni}
                  onChange={(e) => setEditFormData({ ...editFormData, status_penghuni: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                >
                  <option value="tetap">Tetap</option>
                  <option value="kontrak">Kontrak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">No. Telepon</label>
                <input
                  type="text"
                  required
                  value={editFormData.nomor_telepon}
                  onChange={(e) => setEditFormData({ ...editFormData, nomor_telepon: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_sudah_menikah"
                  checked={editFormData.sudah_menikah}
                  onChange={(e) => setEditFormData({ ...editFormData, sudah_menikah: e.target.checked })}
                />
                <label htmlFor="edit_sudah_menikah" className="text-sm font-medium">Sudah Menikah</label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingKtp && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <h3 className="font-bold text-lg">Foto KTP</h3>
              <Button variant="ghost" size="icon" onClick={() => setViewingKtp(null)}>
                <span className="sr-only">Tutup</span>
                <span className="text-xl leading-none">&times;</span>
              </Button>
            </div>
            <div className="p-4 flex justify-center bg-zinc-100 dark:bg-zinc-950">
              <img 
                src={`http://127.0.0.1:8000/storage/${viewingKtp}`} 
                alt="KTP" 
                className="max-h-[70vh] object-contain rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
