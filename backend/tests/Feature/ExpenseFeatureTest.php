<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Expense;

class ExpenseFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_expenses()
    {
        $user = User::factory()->create();
        Expense::create([
            'kategori' => 'Kebersihan',
            'deskripsi' => 'Beli sapu',
            'nominal' => 20000,
            'tanggal' => '2026-06-01',
            'bulan' => 6,
            'tahun' => 2026
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/expenses');
        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    public function test_can_create_expense()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/expenses', [
            'kategori' => 'Kebersihan',
            'deskripsi' => 'Beli pel',
            'nominal' => 30000,
            'tanggal' => '2026-06-02',
            'bulan' => 6,
            'tahun' => 2026
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('expenses', ['deskripsi' => 'Beli pel']);
    }

    public function test_can_update_expense()
    {
        $user = User::factory()->create();
        $expense = Expense::create([
            'kategori' => 'Kebersihan',
            'deskripsi' => 'Beli sapu',
            'nominal' => 20000,
            'tanggal' => '2026-06-01',
            'bulan' => 6,
            'tahun' => 2026
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/expenses/{$expense->id}", [
            'nominal' => 25000,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'nominal' => 25000
        ]);
    }

    public function test_can_delete_expense()
    {
        $user = User::factory()->create();
        $expense = Expense::create([
            'kategori' => 'Kebersihan',
            'deskripsi' => 'Beli sapu',
            'nominal' => 20000,
            'tanggal' => '2026-06-01',
            'bulan' => 6,
            'tahun' => 2026
        ]);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/expenses/{$expense->id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    }
}
