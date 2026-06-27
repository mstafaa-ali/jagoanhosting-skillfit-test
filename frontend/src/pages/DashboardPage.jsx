import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Home, 
  CreditCard, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import api from '../api/axios';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHouses: 0,
    totalResidents: 0,
    unpaidBillings: 0,
    monthlyExpense: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [housesRes, residentsRes, billingsRes, expensesRes, summaryRes, recentBillingsRes] = await Promise.all([
          api.get('/houses'),
          api.get('/residents?status=active'),
          api.get('/billings?status=belum_bayar'),
          api.get('/expenses'),
          api.get('/reports/summary'),
          api.get('/billings?status=lunas')
        ]);

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const currentMonthExpenses = expensesRes.data
          .filter(e => e.bulan === currentMonth && e.tahun === currentYear)
          .reduce((sum, item) => sum + Number(item.nominal), 0);

        const totalUnpaid = billingsRes.data.reduce((sum, item) => sum + Number(item.nominal), 0);

        setStats({
          totalHouses: housesRes.data.length,
          totalResidents: residentsRes.data.length,
          unpaidBillings: totalUnpaid,
          monthlyExpense: currentMonthExpenses
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const formattedChartData = summaryRes.data.map(item => ({
          month: monthNames[item.bulan - 1],
          pemasukan: parseFloat(item.pemasukan) || 0,
          pengeluaran: parseFloat(item.pengeluaran) || 0
        }));

        const currentMonthIndex = new Date().getMonth();
        const startIndex = Math.max(0, currentMonthIndex - 5);
        setChartData(formattedChartData.slice(startIndex, currentMonthIndex + 1));

        const recent = recentBillingsRes.data.sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentPayments(recent);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartConfig = {
    pemasukan: {
      label: "Pemasukan",
      color: "var(--chart-1)",
    },
    pengeluaran: {
      label: "Pengeluaran",
      color: "var(--chart-2)",
    },
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat data dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Ringkasan sistem administrasi RT perumahan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div 
          onClick={() => navigate('/houses')}
          className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Rumah</h3>
            <Home className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalHouses}</div>
            <p className="text-xs text-muted-foreground">Rumah yang terdaftar</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/residents')}
          className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Penghuni</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalResidents}</div>
            <p className="text-xs text-muted-foreground">Aktif saat ini</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/billings')}
          className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Tagihan Belum Lunas</h3>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">
              Rp {stats.unpaidBillings.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1 text-destructive" />
              Menunggu pembayaran
            </p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/expenses')}
          className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pengeluaran Bulan Ini</h3>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              Rp {stats.monthlyExpense.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-primary" />
              Bulan berjalan
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="font-semibold leading-none tracking-tight">Pemasukan vs Pengeluaran</h3>
            <p className="text-sm text-muted-foreground">Grafik arus kas 6 bulan terakhir.</p>
          </div>
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="pemasukan" fill="var(--color-pemasukan)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="var(--color-pengeluaran)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="font-semibold leading-none tracking-tight">Pembayaran Terakhir</h3>
            <p className="text-sm text-muted-foreground">5 aktivitas pembayaran terbaru</p>
          </div>
          <div className="space-y-4">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada pembayaran</p>
            ) : recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Blok {payment.house?.nomor_rumah}</p>
                  <p className="text-sm text-muted-foreground">{payment.resident?.nama_lengkap}</p>
                </div>
                <div className="ml-auto font-medium text-green-600 dark:text-green-400">
                  + Rp {parseFloat(payment.nominal).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
