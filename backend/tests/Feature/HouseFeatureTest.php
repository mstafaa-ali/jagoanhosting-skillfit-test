<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\House;
use App\Models\Resident;

class HouseFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_houses()
    {
        $user = User::factory()->create();
        House::create(['nomor_rumah' => 'A1', 'alamat' => 'Jl. A No 1', 'status' => 'tidak_dihuni']);
        House::create(['nomor_rumah' => 'A2', 'alamat' => 'Jl. A No 2', 'status' => 'tidak_dihuni']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/houses');

        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }

    public function test_can_create_house()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/houses', [
            'nomor_rumah' => 'B1',
            'alamat' => 'Jl. B No 1',
            'status' => 'tidak_dihuni',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('nomor_rumah', 'B1');

        $this->assertDatabaseHas('houses', ['nomor_rumah' => 'B1']);
    }

    public function test_can_update_house_and_destroy()
    {
        $user = User::factory()->create();
        $house = House::create(['nomor_rumah' => 'C1', 'alamat' => 'Jl. C No 1', 'status' => 'tidak_dihuni']);

        $responseUpdate = $this->actingAs($user, 'sanctum')->putJson("/api/houses/{$house->id}", [
            'nomor_rumah' => 'C1-Updated',
        ]);
        $responseUpdate->assertStatus(200)
                       ->assertJsonPath('nomor_rumah', 'C1-Updated');

        $responseDelete = $this->actingAs($user, 'sanctum')->deleteJson("/api/houses/{$house->id}");
        $responseDelete->assertStatus(204);

        $this->assertDatabaseMissing('houses', ['id' => $house->id]);
    }

    public function test_can_assign_resident_to_house()
    {
        $user = User::factory()->create();
        $house = House::create(['nomor_rumah' => 'D1', 'alamat' => 'Jl. D No 1', 'status' => 'tidak_dihuni']);
        $resident = Resident::create([
            'nama_lengkap' => 'Budi',
            'alamat' => 'Asal',
            'status_penghuni' => 'tetap',
            'nomor_telepon' => '08123',
            'sudah_menikah' => true
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/houses/{$house->id}/assign-resident", [
            'resident_id' => $resident->id,
            'tanggal_masuk' => '2026-06-01',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('house_residents', [
            'house_id' => $house->id,
            'resident_id' => $resident->id,
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('houses', ['id' => $house->id, 'status' => 'dihuni']);
    }

    public function test_can_remove_resident_from_house()
    {
        $user = User::factory()->create();
        $house = House::create(['nomor_rumah' => 'E1', 'alamat' => 'Jl. E No 1', 'status' => 'tidak_dihuni']);
        $resident = Resident::create([
            'nama_lengkap' => 'Siti',
            'alamat' => 'Asal',
            'status_penghuni' => 'kontrak',
            'nomor_telepon' => '08124',
            'sudah_menikah' => false
        ]);

        // Assign first
        $this->actingAs($user, 'sanctum')->postJson("/api/houses/{$house->id}/assign-resident", [
            'resident_id' => $resident->id,
            'tanggal_masuk' => '2026-06-01',
        ]);

        // Then remove
        $response = $this->actingAs($user, 'sanctum')->postJson("/api/houses/{$house->id}/remove-resident", [
            'resident_id' => $resident->id,
            'tanggal_keluar' => '2026-06-30',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('house_residents', [
            'house_id' => $house->id,
            'resident_id' => $resident->id,
            'is_active' => false,
            'tanggal_keluar' => '2026-06-30',
        ]);
        $this->assertDatabaseHas('houses', ['id' => $house->id, 'status' => 'tidak_dihuni']);
    }
}
