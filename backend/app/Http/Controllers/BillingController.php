<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\House;
use App\Models\FeeType;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        return Billing::query()
            ->when($request->bulan, fn($q, $bulan) => $q->where('bulan', $bulan))
            ->when($request->tahun, fn($q, $tahun) => $q->where('tahun', $tahun))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->house_id, fn($q, $houseId) => $q->where('house_id', $houseId))
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'required|exists:residents,id',
            'fee_type_id' => 'required|exists:fee_types,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer',
            'nominal' => 'required|numeric',
        ]);

        $data['status'] = 'belum_bayar';

        return Billing::create($data);
    }

    public function update(Request $request, Billing $billing)
    {
        $data = $request->validate([
            'status' => 'required|in:belum_bayar,lunas',
            'keterangan' => 'nullable|string',
        ]);

        if ($data['status'] === 'lunas' && $billing->status !== 'lunas') {
            $data['tanggal_bayar'] = now();
        }

        $billing->update($data);
        return $billing;
    }

    public function generate(Request $request)
    {
        $bulan = $request->input('bulan', now()->month);
        $tahun = $request->input('tahun', now()->year);
        $feeTypes = FeeType::all();

        $houses = House::where('status', 'dihuni')->with(['residents' => function($q) {
            $q->wherePivot('is_active', true);
        }])->get();

        $generated = 0;

        foreach ($houses as $house) {
            $activeResident = $house->residents->first();
            if (!$activeResident) continue;

            foreach ($feeTypes as $fee) {
                $billing = Billing::firstOrCreate([
                    'house_id' => $house->id,
                    'fee_type_id' => $fee->id,
                    'bulan' => $bulan,
                    'tahun' => $tahun,
                ], [
                    'resident_id' => $activeResident->id,
                    'nominal' => $fee->nominal,
                    'status' => 'belum_bayar',
                ]);
                
                if ($billing->wasRecentlyCreated) $generated++;
            }
        }

        return response()->json(['message' => "Generated $generated billings for $bulan/$tahun"]);
    }

    public function bulkPay(Request $request)
    {
        $data = $request->validate([
            'billing_ids' => 'required|array',
            'billing_ids.*' => 'exists:billings,id',
        ]);

        Billing::whereIn('id', $data['billing_ids'])
            ->where('status', '!=', 'lunas')
            ->update([
                'status' => 'lunas',
                'tanggal_bayar' => now(),
            ]);

        return response()->json(['message' => 'Bulk payment successful']);
    }
}
