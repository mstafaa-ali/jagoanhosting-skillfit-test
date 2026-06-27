import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Home, User, CreditCard, CalendarDays, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from '../api/axios';

export default function HouseDetailPage() {
  const { id } = useParams();
  
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  
  const [residents, setResidents] = useState([]);
  const [assignForm, setAssignForm] = useState({ resident_id: '', tanggal_masuk: '' });
  const [removeForm, setRemoveForm] = useState({ tanggal_keluar: '' });

  const fetchHouse = async () => {
    try {
      const response = await api.get(`/houses/${id}`);
      setHouse(response.data);
    } catch (error) {
      console.error("Error fetching house detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    try {
      const response = await api.get('/residents');
      setResidents(response.data);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  useEffect(() => {
    fetchHouse();
    fetchResidents();
  }, [id]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/houses/${id}/assign-resident`, assignForm);
      setIsAssignModalOpen(false);
      setAssignForm({ resident_id: '', tanggal_masuk: '' });
      fetchHouse();
    } catch (error) {
      console.error("Error assigning resident:", error);
    }
  };

  const handleRemoveSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/houses/${id}/remove-resident`, {
        resident_id: activeResident?.id,
        tanggal_keluar: removeForm.tanggal_keluar
      });
      setIsRemoveModalOpen(false);
      setRemoveForm({ tanggal_keluar: '' });
      fetchHouse();
    } catch (error) {
      console.error("Error removing resident:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat data detail rumah...</div>;
  }

  if (!house) {
    return <div className="p-8 text-center text-muted-foreground">Rumah tidak ditemukan.</div>;
  }

  const activeResident = house.residents?.find(r => r.pivot.is_active);
  const historyPenghuni = house.residents || [];
  const historyPembayaran = house.billings || [];

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Rumah {house.nomor_rumah}</h2>
          <p className="text-muted-foreground mt-1">
            Informasi lengkap, histori penghuni, dan pembayaran.
          </p>
        </div>
        <Button variant="default" size="lg" className="shadow-sm hover:-translate-y-0.5 transition-transform" asChild>
          <Link to="/houses" className="flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{house.nomor_rumah}</h3>
                  <p className="text-sm text-muted-foreground">{house.alamat}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Status Rumah</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  house.status === 'dihuni'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {house.status === 'dihuni' ? 'Dihuni' : 'Kosong'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Sejak</p>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{activeResident ? activeResident.pivot.tanggal_masuk : "-"}</span>
                </div>
              </div>
            </div>
            {!activeResident && (
              <div className="p-4 bg-muted/30 border-t flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={() => setIsAssignModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Penghuni
                </Button>
              </div>
            )}
          </div>

          {activeResident && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-muted/20">
                <h3 className="font-semibold text-md flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Detail Penghuni Aktif
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Nama Lengkap</p>
                  <p className="text-sm font-medium">{activeResident.nama_lengkap}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status Penghuni</p>
                  <p className="text-sm font-medium capitalize">{activeResident.status_penghuni}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Nomor Telepon</p>
                  <p className="text-sm font-medium">{activeResident.nomor_telepon || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status Pernikahan</p>
                  <p className="text-sm font-medium">{activeResident.sudah_menikah ? "Sudah Menikah" : "Belum Menikah"}</p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={() => setIsRemoveModalOpen(true)}>
                    Hentikan Penghuni
                  </Button>
                  <Button variant="ghost" className="w-full text-primary hover:text-primary" asChild>
                    <Link to={`/residents`}>
                      Kelola Data Penghuni
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Histori Penghuni
            </h3>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nama</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tanggal Masuk</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tanggal Keluar</th>
                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {historyPenghuni.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-muted-foreground">Belum ada histori penghuni</td></tr>
                  ) : historyPenghuni.map((r, idx) => (
                    <tr key={idx} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{r.nama_lengkap}</td>
                      <td className="p-4 align-middle">{r.pivot.tanggal_masuk}</td>
                      <td className="p-4 align-middle">{r.pivot.tanggal_keluar || "-"}</td>
                      <td className="p-4 align-middle text-center">
                        {r.pivot.is_active ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                            Lama
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Histori Pembayaran Iuran
            </h3>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Bulan Tagihan</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Jenis Iuran</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nominal</th>
                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tanggal Bayar</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {historyPembayaran.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-muted-foreground">Belum ada histori pembayaran</td></tr>
                  ) : historyPembayaran.map((h) => (
                    <tr key={h.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{monthNames[h.bulan - 1]} {h.tahun}</td>
                      <td className="p-4 align-middle">{h.fee_type?.nama || "Iuran"}</td>
                      <td className="p-4 align-middle">Rp {parseFloat(h.nominal || 0).toLocaleString('id-ID')}</td>
                      <td className="p-4 align-middle text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          h.status === 'lunas' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {h.status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="p-4 align-middle">{h.status === 'lunas' ? new Date(h.updated_at).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Tambah Penghuni */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Tambah Penghuni</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pilih Penghuni</label>
                <select 
                  required
                  value={assignForm.resident_id}
                  onChange={(e) => setAssignForm({...assignForm, resident_id: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">-- Pilih Penghuni --</option>
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.nama_lengkap}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Masuk</label>
                <input 
                  type="date" 
                  required
                  value={assignForm.tanggal_masuk}
                  onChange={(e) => setAssignForm({...assignForm, tanggal_masuk: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
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

      {/* Modal Hentikan Penghuni */}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Hentikan Penghuni Aktif</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Penghuni {activeResident?.nama_lengkap} akan dihentikan dari rumah ini.
            </p>
            <form onSubmit={handleRemoveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Keluar</label>
                <input 
                  type="date" 
                  required
                  value={removeForm.tanggal_keluar}
                  onChange={(e) => setRemoveForm({...removeForm, tanggal_keluar: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsRemoveModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="destructive">
                  Konfirmasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
