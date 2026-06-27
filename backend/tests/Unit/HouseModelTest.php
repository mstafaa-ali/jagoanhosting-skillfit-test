<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\House;
use App\Models\Resident;
use Illuminate\Foundation\Testing\RefreshDatabase;

class HouseModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_house_can_have_residents()
    {
        $house = House::create(['nomor_rumah' => '1', 'alamat' => 'A', 'status' => 'dihuni']);
        $resident = Resident::create([
            'nama_lengkap' => 'Budi', 'alamat' => 'A', 'status_penghuni' => 'tetap',
            'nomor_telepon' => '08', 'sudah_menikah' => false
        ]);

        $house->residents()->attach($resident->id, ['is_active' => true, 'tanggal_masuk' => now()]);

        $this->assertTrue($house->residents->contains($resident));
        $this->assertEquals(1, $house->residents->count());
        $this->assertTrue((bool)$house->residents->first()->pivot->is_active);
    }
}
