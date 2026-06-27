<?php

namespace App\Http\Controllers;

use App\Models\House;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HouseController extends Controller
{
    public function index()
    {
        return House::with(['residents' => function($q) {
            $q->wherePivot('is_active', true);
        }])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nomor_rumah' => 'required|string|unique:houses',
            'alamat' => 'required|string',
            'status' => 'required|in:dihuni,tidak_dihuni',
        ]);

        return House::create($data);
    }

    public function show(House $house)
    {
        // ponytail: assuming relations exist or will exist on model
        $house->load(['residents', 'billings.feeType']);
        return $house;
    }

    public function update(Request $request, House $house)
    {
        $data = $request->validate([
            'nomor_rumah' => 'sometimes|string|unique:houses,nomor_rumah,' . $house->id,
            'alamat' => 'sometimes|string',
            'status' => 'sometimes|in:dihuni,tidak_dihuni',
        ]);

        $house->update($data);
        return $house;
    }

    public function destroy(House $house)
    {
        $house->delete();
        return response()->noContent();
    }

    public function assignResident(Request $request, House $house)
    {
        $data = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'tanggal_masuk' => 'required|date',
        ]);

        DB::table('house_residents')->insert([
            'house_id' => $house->id,
            'resident_id' => $data['resident_id'],
            'tanggal_masuk' => $data['tanggal_masuk'],
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $house->update(['status' => 'dihuni']);

        // Update the resident's alamat to match the house
        $resident = \App\Models\Resident::find($data['resident_id']);
        if ($resident) {
            $alamatBaru = trim("{$house->alamat}", " ,");
            $resident->update(['alamat' => $alamatBaru]);
        }

        return response()->json(['message' => 'Resident assigned successfully']);
    }

    public function removeResident(Request $request, House $house)
    {
        $data = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'tanggal_keluar' => 'required|date',
        ]);

        DB::table('house_residents')
            ->where('house_id', $house->id)
            ->where('resident_id', $data['resident_id'])
            ->where('is_active', true)
            ->update([
                'tanggal_keluar' => $data['tanggal_keluar'],
                'is_active' => false,
                'updated_at' => now(),
            ]);

        if (!DB::table('house_residents')->where('house_id', $house->id)->where('is_active', true)->exists()) {
            $house->update(['status' => 'tidak_dihuni']);
        }

        // Kosongkan alamat penghuni ketika dihentikan dari rumah
        $resident = \App\Models\Resident::find($data['resident_id']);
        if ($resident) {
            $resident->update(['alamat' => '']); // Atau bisa juga diset menjadi alamat default lainnya
        }

        return response()->json(['message' => 'Resident removed successfully']);
    }
}
