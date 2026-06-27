<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Billing;
use App\Models\Expense;
use App\Models\House;
use App\Models\Resident;
use App\Models\FeeType;

class ReportFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_summary_report()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')->getJson('/api/reports/summary');
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'bulan',
                         'pemasukan',
                         'pengeluaran',
                         'saldo'
                     ]
                 ]);
    }

    public function test_can_get_monthly_report()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/reports/monthly?bulan=6&tahun=2026');
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'pemasukan',
                     'pengeluaran'
                 ]);
    }
}
