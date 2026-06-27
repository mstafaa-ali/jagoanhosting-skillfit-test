<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\FeeType;

class FeeTypeFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_fee_types()
    {
        $user = User::factory()->create();
        FeeType::create(['nama' => 'Iuran Kebersihan', 'nominal' => 15000]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/fee-types');
        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    public function test_can_update_fee_type()
    {
        $user = User::factory()->create();
        $feeType = FeeType::create(['nama' => 'Iuran Keamanan', 'nominal' => 100000]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/fee-types/{$feeType->id}", [
            'nominal' => 120000
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('fee_types', [
            'id' => $feeType->id,
            'nominal' => 120000
        ]);
    }
}
