<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;

class ResidentController extends Controller
{
    public function index(Request $request)
    {
        $query = Resident::query();

        if ($request->query('status') === 'active') {
            $query->whereHas('houses', function ($q) {
                $q->where('is_active', true);
            });
        } elseif ($request->query('status') === 'inactive') {
            $query->whereDoesntHave('houses', function ($q) {
                $q->where('is_active', true);
            });
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_lengkap' => 'required|string',
            'alamat' => 'required|string',
            'foto_ktp' => 'nullable|image',
            'status_penghuni' => 'required|in:tetap,kontrak',
            'nomor_telepon' => 'required|string',
            'sudah_menikah' => 'required|boolean',
        ]);

        if ($request->hasFile('foto_ktp')) {
            $data['foto_ktp'] = $request->file('foto_ktp')->store('ktp', 'public');
        }

        return Resident::create($data);
    }

    public function show(Resident $resident)
    {
        return $resident;
    }

    public function update(Request $request, Resident $resident)
    {
        $data = $request->validate([
            'nama_lengkap' => 'sometimes|string',
            'alamat' => 'sometimes|string',
            'foto_ktp' => 'nullable|image',
            'status_penghuni' => 'sometimes|in:tetap,kontrak',
            'nomor_telepon' => 'sometimes|string',
            'sudah_menikah' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('foto_ktp')) {
            $data['foto_ktp'] = $request->file('foto_ktp')->store('ktp', 'public');
        }

        $resident->update($data);
        return $resident;
    }

    public function destroy(Resident $resident)
    {
        $resident->delete();
        return response()->noContent();
    }
}
