<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Resident;

class ResidentFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_residents()
    {
        $user = User::factory()->create();
        Resident::create([
            'nama_lengkap' => 'A', 'alamat' => 'A', 'status_penghuni' => 'tetap',
            'nomor_telepon' => '08', 'sudah_menikah' => false
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/residents');
        $response->assertStatus(200)->assertJsonCount(1);
    }

    public function test_authenticated_user_can_create_a_resident()
    {
        $user = User::factory()->create();
        
        $payload = [
            'nama_lengkap' => 'Budi Santoso',
            'alamat' => 'Jl. Kebenaran No 1',
            'status_penghuni' => 'tetap',
            'nomor_telepon' => '081234567890',
            'sudah_menikah' => true,
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/residents', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('nama_lengkap', 'Budi Santoso');

        $this->assertDatabaseHas('residents', [
            'nama_lengkap' => 'Budi Santoso',
            'nomor_telepon' => '081234567890',
        ]);
    }

    public function test_can_update_resident()
    {
        $user = User::factory()->create();
        $resident = Resident::create([
            'nama_lengkap' => 'A', 'alamat' => 'A', 'status_penghuni' => 'tetap',
            'nomor_telepon' => '08', 'sudah_menikah' => false
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/residents/{$resident->id}", [
            'nama_lengkap' => 'A-Updated'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('residents', ['id' => $resident->id, 'nama_lengkap' => 'A-Updated']);
    }

    public function test_can_delete_resident()
    {
        $user = User::factory()->create();
        $resident = Resident::create([
            'nama_lengkap' => 'A', 'alamat' => 'A', 'status_penghuni' => 'tetap',
            'nomor_telepon' => '08', 'sudah_menikah' => false
        ]);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/residents/{$resident->id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('residents', ['id' => $resident->id]);
    }

    public function test_unauthenticated_user_cannot_access_residents()
    {
        $response = $this->getJson('/api/residents');
        $response->assertStatus(401);
    }
}
