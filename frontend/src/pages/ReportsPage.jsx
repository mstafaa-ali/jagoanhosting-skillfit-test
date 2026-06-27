import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useState, useEffect, useRef } from "react";
import api from '../api/axios';
import { useReactToPrint } from 'react-to-print';

export default function ReportsPage() {
  const printRef = useRef();
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ pemasukan: 0, pengeluaran: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);

  const [detailMonth, setDetailMonth] = useState(new Date().getMonth() + 1);
  const [detailYear, setDetailYear] = useState(new Date().getFullYear());
  const [detailData, setDetailData] = useState({ pemasukan: [], pengeluaran: [] });
  const [loadingDetail, setLoadingDetail] = useState(false);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get('/reports/summary');
        
        let totalPemasukan = 0;
        let totalPengeluaran = 0;

        const formattedChartData = response.data.map(item => {
          totalPemasukan += parseFloat(item.pemasukan);
          totalPengeluaran += parseFloat(item.pengeluaran);
          return {
            month: monthNames[item.bulan - 1],
            pemasukan: parseFloat(item.pemasukan) || 0,
            pengeluaran: parseFloat(item.pengeluaran) || 0
          };
        });

        setChartData(formattedChartData);
        setStats({
          pemasukan: totalPemasukan,
          pengeluaran: totalPengeluaran,
          saldo: totalPemasukan - totalPengeluaran
        });
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        const res = await api.get(`/reports/monthly?month=${detailMonth}&year=${detailYear}`);
        setDetailData({
          pemasukan: res.data.pemasukan || [],
          pengeluaran: res.data.pengeluaran || []
        });
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [detailMonth, detailYear]);

  const chartConfig = {
    pemasukan: {
      label: "Pemasukan (Iuran)",
      color: "var(--chart-1)",
    },
    pengeluaran: {
      label: "Pengeluaran",
      color: "var(--chart-2)",
    },
  };

  const handleExportPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan_Keuangan_RT_${currentYear}`,
  });

  return (
    <div className="space-y-6" ref={printRef}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h2>
          <p className="text-muted-foreground mt-1">
            Visualisasi dan statistik keuangan RT.
          </p>
        </div>
        <div className="print:hidden">
          <Button onClick={handleExportPDF} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Tahun Ini</CardTitle>
              <CardDescription>Statistik dari Januari hingga Desember {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Total Pemasukan</span>
                <span className="font-semibold text-green-600 dark:text-green-400">Rp {stats.pemasukan.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Total Pengeluaran</span>
                <span className="font-semibold text-destructive">Rp {stats.pengeluaran.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium">Saldo Kas Aktif</span>
                <span className="font-bold text-xl">Rp {stats.saldo.toLocaleString('id-ID')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Arus Kas Bulanan</CardTitle>
              <CardDescription>Perbandingan pemasukan iuran dan pengeluaran operasional per bulan</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="pemasukan" fill="var(--color-pemasukan)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pengeluaran" fill="var(--color-pengeluaran)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-semibold">Detail Laporan Bulanan</h3>
          <div className="flex gap-2">
            <select 
              value={detailMonth}
              onChange={(e) => setDetailMonth(e.target.value)}
              className="h-9 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {monthNames.map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
            <select 
              value={detailYear}
              onChange={(e) => setDetailYear(e.target.value)}
              className="h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pemasukan (Iuran Lunas)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDetail ? (
                <p className="text-muted-foreground text-sm">Memuat data...</p>
              ) : (
                <div className="relative w-full overflow-auto max-h-[400px]">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b sticky top-0 bg-card">
                      <tr className="border-b">
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Rumah</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Jenis</th>
                        <th className="h-10 px-2 text-right font-medium text-muted-foreground">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {detailData.pemasukan.length === 0 ? (
                        <tr><td colSpan="3" className="p-4 text-center text-muted-foreground">Tidak ada data</td></tr>
                      ) : detailData.pemasukan.map(p => (
                        <tr key={p.id} className="border-b">
                          <td className="p-2">{p.house?.nomor_rumah} ({p.resident?.nama_lengkap})</td>
                          <td className="p-2">{p.fee_type?.nama}</td>
                          <td className="p-2 text-right text-green-600">Rp {parseFloat(p.nominal).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDetail ? (
                <p className="text-muted-foreground text-sm">Memuat data...</p>
              ) : (
                <div className="relative w-full overflow-auto max-h-[400px]">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b sticky top-0 bg-card">
                      <tr className="border-b">
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Kategori & Deskripsi</th>
                        <th className="h-10 px-2 text-left font-medium text-muted-foreground">Tanggal</th>
                        <th className="h-10 px-2 text-right font-medium text-muted-foreground">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {detailData.pengeluaran.length === 0 ? (
                        <tr><td colSpan="3" className="p-4 text-center text-muted-foreground">Tidak ada data</td></tr>
                      ) : detailData.pengeluaran.map(p => (
                        <tr key={p.id} className="border-b">
                          <td className="p-2">
                            <div className="font-medium">{p.kategori}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{p.deskripsi}</div>
                          </td>
                          <td className="p-2 align-top">{p.tanggal}</td>
                          <td className="p-2 text-right text-destructive align-top">Rp {parseFloat(p.nominal).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
