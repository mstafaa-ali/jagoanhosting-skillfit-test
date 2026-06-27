import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Home, Info, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from '../api/axios';

export default function HousesPage() {
  const navigate = useNavigate();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const [formData, setFormData] = useState({
    nomor_rumah: '',
    alamat: '',
    status: 'tidak_dihuni'
  });
  
  const [editFormData, setEditFormData] = useState({
    nomor_rumah: '',
    alamat: '',
    status: 'tidak_dihuni'
  });

  const fetchHouses = async () => {
    try {
      const response = await api.get('/houses');
      setHouses(response.data);
    } catch (error) {
      console.error("Error fetching houses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/houses', formData);
      setIsAddModalOpen(false);
      setFormData({
        nomor_rumah: '',
        alamat: '',
        status: 'tidak_dihuni'
      });
      fetchHouses();
    } catch (error) {
      console.error("Error adding house:", error);
    }
  };

  const handleEditClick = (house) => {
    setEditingId(house.id);
    setEditFormData({
      nomor_rumah: house.nomor_rumah,
      alamat: house.alamat,
      status: house.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/houses/${editingId}`, editFormData);
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchHouses();
    } catch (error) {
      console.error("Error editing house:", error);
    }
  };

  const filteredHouses = houses.filter(h => 
    (h.nomor_rumah.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (h.alamat && h.alamat.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterStatus === "" || h.status === filterStatus)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Rumah</h2>
          <p className="text-muted-foreground mt-1">
            Kelola data rumah, status huni, dan histori penghuni.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Rumah
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nomor rumah atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Semua Status</option>
            <option value="dihuni">Dihuni</option>
            <option value="tidak_dihuni">Kosong</option>
          </select>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center p-8 text-muted-foreground">Memuat data rumah...</div>
          ) : filteredHouses.length === 0 ? (
            <div className="col-span-full text-center p-8 text-muted-foreground">Data tidak ditemukan.</div>
          ) : filteredHouses.map((house) => (
            <div 
              key={house.id} 
              onClick={() => navigate(`/houses/${house.id}`)}
              className="rounded-xl border bg-card shadow-sm hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 duration-200 transition-all overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-full ${
                    house.status === 'dihuni' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <Home className="h-6 w-6" />
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    house.status === 'dihuni'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {house.status === 'dihuni' ? 'Dihuni' : 'Kosong'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-xl mb-1">{house.nomor_rumah}</h3>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm">
                    <span className="text-muted-foreground mr-2">Alamat:</span>
                    <span className="font-medium line-clamp-1">{house.alamat || '-'}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/30 p-3 flex justify-between items-center border-t">
                <div className="flex items-center text-primary text-sm font-medium px-2">
                  <Info className="h-4 w-4 mr-2" />
                  Detail Rumah
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(house);
                  }} 
                  className="text-primary hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Tambah Rumah</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nomor Rumah</label>
                <input 
                  type="text" 
                  required
                  value={formData.nomor_rumah}
                  onChange={(e) => setFormData({...formData, nomor_rumah: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="Misal: A-01"
                />

              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                <textarea 
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status Huni</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                >
                  <option value="tidak_dihuni">Kosong / Tidak Dihuni</option>
                  <option value="dihuni">Dihuni</option>
                </select>
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Rumah</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nomor Rumah</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.nomor_rumah}
                  onChange={(e) => setEditFormData({...editFormData, nomor_rumah: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />

              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                <textarea 
                  required
                  value={editFormData.alamat}
                  onChange={(e) => setEditFormData({...editFormData, alamat: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status Huni</label>
                <select 
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                >
                  <option value="tidak_dihuni">Kosong / Tidak Dihuni</option>
                  <option value="dihuni">Dihuni</option>
                </select>
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
    </div>
  );
}
