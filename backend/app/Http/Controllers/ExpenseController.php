<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        return Expense::query()
            ->when($request->bulan, fn($q, $bulan) => $q->where('bulan', $bulan))
            ->when($request->tahun, fn($q, $tahun) => $q->where('tahun', $tahun))
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kategori' => 'required|string',
            'deskripsi' => 'required|string',
            'nominal' => 'required|numeric',
            'tanggal' => 'required|date',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer',
        ]);

        return Expense::create($data);
    }

    public function show(Expense $expense)
    {
        return $expense;
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'kategori' => 'sometimes|string',
            'deskripsi' => 'sometimes|string',
            'nominal' => 'sometimes|numeric',
            'tanggal' => 'sometimes|date',
            'bulan' => 'sometimes|integer|min:1|max:12',
            'tahun' => 'sometimes|integer',
        ]);

        $expense->update($data);
        return $expense;
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->noContent();
    }
}
