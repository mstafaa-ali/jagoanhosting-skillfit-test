<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Billing;
use App\Models\House;
use App\Models\Resident;
use App\Models\FeeType;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BillingModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_billing_belongs_to_house_resident_and_fee_type()
    {
        $house = House::create(['nomor_rumah' => '1', 'alamat' => 'A', 'status' => 'dihuni']);
        $resident = Resident::create([
            'nama_lengkap' => 'Budi', 'alamat' => 'A', 'status_penghuni' => 'tetap',
            'nomor_telepon' => '08', 'sudah_menikah' => false
        ]);
        $feeType = FeeType::create(['nama' => 'Iuran', 'nominal' => 1000]);

        $billing = Billing::create([
            'house_id' => $house->id,
            'resident_id' => $resident->id,
            'fee_type_id' => $feeType->id,
            'bulan' => 1,
            'tahun' => 2026,
            'nominal' => 1000,
            'status' => 'belum_bayar'
        ]);

        $this->assertEquals($house->id, $billing->house->id);
        $this->assertEquals($resident->id, $billing->resident->id);
        $this->assertEquals($feeType->id, $billing->feeType->id);
    }
}
