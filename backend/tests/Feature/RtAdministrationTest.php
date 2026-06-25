<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RtAdministrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_end_to_end_flow()
    {
        // 0. Seed Fee Types
        \App\Models\FeeType::create(['nama' => 'Satpam', 'nominal' => 100000, 'deskripsi' => '']);
        \App\Models\FeeType::create(['nama' => 'Kebersihan', 'nominal' => 15000, 'deskripsi' => '']);

        // 1. Create resident
        $residentRes = $this->postJson('/api/residents', [
            'nama_lengkap' => 'Budi Tabuti',
            'status_penghuni' => 'tetap',
            'nomor_telepon' => '08123456789',
            'sudah_menikah' => true,
        ])->assertStatus(201);
        $residentId = $residentRes->json('id');

        // 2. Create house
        $houseRes = $this->postJson('/api/houses', [
            'nomor_rumah' => 'A99',
            'alamat' => 'Jalan Kebenaran No 99',
            'blok' => 'A',
            'status' => 'tidak_dihuni'
        ])->assertStatus(201);
        $houseId = $houseRes->json('id');

        // 3. Assign resident
        $this->postJson("/api/houses/{$houseId}/assign-resident", [
            'resident_id' => $residentId,
            'tanggal_masuk' => '2026-06-01'
        ])->assertStatus(200);

        // 4. Generate billing
        $this->postJson('/api/billings/generate')->assertStatus(200);

        // Check if billing is generated for our specific house
        $billings = $this->getJson('/api/billings')->assertStatus(200);
        $this->assertNotEmpty($billings->json());
        
        $myBilling = collect($billings->json())->firstWhere('house_id', $houseId);
        $this->assertNotNull($myBilling, 'Billing was not generated for the house');

        // 5. Pay billing
        $this->putJson("/api/billings/{$myBilling['id']}", [
            'status' => 'lunas'
        ])->assertStatus(200);

        // 6. Add expense
        $this->postJson('/api/expenses', [
            'kategori' => 'perbaikan_jalan',
            'deskripsi' => 'Beli aspal',
            'nominal' => 50000,
            'tanggal' => '2026-06-15',
            'bulan' => 6,
            'tahun' => 2026
        ])->assertStatus(201);

        // 7. Check reports
        $summary = $this->getJson('/api/reports/summary?year=2026')->assertStatus(200);
        $june = collect($summary->json())->firstWhere('bulan', 6);
        $this->assertTrue($june['pemasukan'] > 0);
        $this->assertTrue($june['pengeluaran'] >= 50000);
        
        $monthly = $this->getJson('/api/reports/monthly?month=6&year=2026')->assertStatus(200);
        $this->assertTrue(count($monthly->json('pengeluaran')) >= 1);
        $this->assertTrue(count($monthly->json('pemasukan')) >= 1);
    }
}
