<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Expense;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $year = $request->input('year', date('Y'));

        // ponytail: pull and aggregate in memory. One query per table vs complex SQL grouping.
        $billings = Billing::where('tahun', $year)->where('status', 'lunas')->get();
        $expenses = Expense::where('tahun', $year)->get();

        $summary = [];
        for ($i = 1; $i <= 12; $i++) {
            $income = $billings->where('bulan', $i)->sum('nominal');
            $expense = $expenses->where('bulan', $i)->sum('nominal');
            $summary[] = [
                'bulan' => $i,
                'pemasukan' => $income,
                'pengeluaran' => $expense,
                'saldo' => $income - $expense,
            ];
        }

        return response()->json($summary);
    }

    public function monthly(Request $request)
    {
        $month = $request->input('month', date('n'));
        $year = $request->input('year', date('Y'));

        // ponytail: direct model dump, formatting belongs to frontend.
        return response()->json([
            'pemasukan' => Billing::with(['resident', 'house', 'feeType'])
                ->where('tahun', $year)
                ->where('bulan', $month)
                ->where('status', 'lunas')
                ->get(),
            'pengeluaran' => Expense::where('tahun', $year)
                ->where('bulan', $month)
                ->get(),
        ]);
    }
}
