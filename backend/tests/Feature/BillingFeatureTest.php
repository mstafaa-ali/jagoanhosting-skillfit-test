<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Billing;
use App\Models\House;
use App\Models\Resident;
use App\Models\FeeType;

class BillingFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_billings()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')->getJson('/api/billings');
        $response->assertStatus(200);
    }

    public function test_can_create_billing()
    {
        $user = User::factory()->create();
        $house = House::create(['nomor_rumah' => 'B1', 'alamat' => 'Jl. B No 1', 'status' => 'dihuni']);
        $resident = Resident::create([
            'nama_lengkap' => 'Budi',
            'alamat' => 'Asal',
            'status_penghuni' => 'tetap',
            'nomor_telepon' => '08123',
            'sudah_menikah' => true
        ]);
        $feeType = FeeType::create(['nama' => 'Iuran', 'nominal' => 100000]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/billings', [
            'house_id' => $house->id,
            'resident_id' => $resident->id,
            'fee_type_id' => $feeType->id,
            'bulan' => 6,
            'tahun' => 2026,
            'nominal' => 100000,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('billings', [
            'house_id' => $house->id,
            'nominal' => 100000,
            'status' => 'belum_bayar'
        ]);
    }

    public function test_can_update_billing_status()
    {
        $user = User::factory()->create();
        $house = House::create(['nomor_rumah' => 'B1', 'alamat' => 'Jl. B', 'status' => 'dihuni']);
        $resident = Resident::create([
            'nama_lengkap' => 'Budi', 'alamat' => 'Asal', 'status_penghuni' => 'tetap',
            'nomor_telepon' => '08', 'sudah_menikah' => true
        ]);
        $feeType = FeeType::create(['nama' => 'Iuran', 'nominal' => 100000]);
        $billing = Billing::create([
            'house_id' => $house->id, 'resident_id' => $resident->id, 'fee_type_id' => $feeType->id,
            'bulan' => 6, 'tahun' => 2026, 'nominal' => 100000, 'status' => 'belum_bayar'
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/billings/{$billing->id}", [
            'status' => 'lunas'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('billings', [
            'id' => $billing->id,
            'status' => 'lunas'
        ]);
    }

    public function test_can_bulk_pay_billings()
    {
        $user = User::factory()->create();
        $house = House::create(['nomor_rumah' => 'B1', 'alamat' => 'Jl. B', 'status' => 'dihuni']);
        $resident = Resident::create([
            'nama_lengkap' => 'Budi', 'alamat' => 'Asal', 'status_penghuni' => 'tetap',
            'nomor_telepon' => '08', 'sudah_menikah' => true
        ]);
        $feeType = FeeType::create(['nama' => 'Iuran', 'nominal' => 100000]);
        $billing1 = Billing::create([
            'house_id' => $house->id, 'resident_id' => $resident->id, 'fee_type_id' => $feeType->id,
            'bulan' => 6, 'tahun' => 2026, 'nominal' => 100000, 'status' => 'belum_bayar'
        ]);
        $billing2 = Billing::create([
            'house_id' => $house->id, 'resident_id' => $resident->id, 'fee_type_id' => $feeType->id,
            'bulan' => 7, 'tahun' => 2026, 'nominal' => 100000, 'status' => 'belum_bayar'
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/billings/bulk-pay", [
            'billing_ids' => [$billing1->id, $billing2->id]
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('billings', ['id' => $billing1->id, 'status' => 'lunas']);
        $this->assertDatabaseHas('billings', ['id' => $billing2->id, 'status' => 'lunas']);
    }
}
