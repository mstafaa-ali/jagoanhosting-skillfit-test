<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\House;
use App\Models\Resident;
use App\Models\FeeType;
use App\Models\Billing;
use App\Models\Expense;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear all tables to avoid duplicates when running multiple times
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        House::truncate();
        Resident::truncate();
        FeeType::truncate();
        Billing::truncate();
        Expense::truncate();
        DB::table('house_residents')->truncate();
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Create Admin User
        User::create([
            'name' => 'Admin RT',
            'email' => 'admin@rt.com',
            'password' => Hash::make('password123'),
        ]);

        // 2. Create Fee Types (Satpam: 100k, Kebersihan: 15k)
        $feeKebersihan = FeeType::create([
            'nama' => 'Iuran Kebersihan',
            'nominal' => 15000,
        ]);

        $feeSatpam = FeeType::create([
            'nama' => 'Iuran Satpam',
            'nominal' => 100000,
        ]);

        // 3. Create 20 Houses
        $houses = [];
        $streets = ['Mawar', 'Melati'];
        for ($i = 1; $i <= 20; $i++) {
            $streetIndex = $i <= 10 ? 0 : 1;
            $nomor = $i <= 10 ? $i : $i - 10;
            $streetName = $streets[$streetIndex];
            
            $houses[] = House::create([
                'nomor_rumah' => "{$streetName} {$nomor}",
                'alamat' => "Jl. {$streetName} No.{$nomor}, RT 01 RW 5",
                'status' => 'tidak_dihuni' // will be updated later
            ]);
        }

        // 4. Create Residents (15 Tetap, 8 Kontrak for history & temp)
        $faker = \Faker\Factory::create('id_ID');
        
        $residentsTetap = [];
        for ($i = 1; $i <= 15; $i++) {
            $residentsTetap[] = Resident::create([
                'nama_lengkap' => $faker->name,
                'status_penghuni' => 'tetap',
                'nomor_telepon' => '081234567' . sprintf('%03d', $i),
                'sudah_menikah' => (bool)rand(0, 1),
                'foto_ktp' => 'ktp/placeholder-ktp.jpg'
            ]);
        }

        $residentsKontrak = [];
        for ($i = 1; $i <= 8; $i++) {
            $residentsKontrak[] = Resident::create([
                'nama_lengkap' => $faker->name,
                'status_penghuni' => 'kontrak',
                'nomor_telepon' => '081987654' . sprintf('%03d', $i),
                'sudah_menikah' => (bool)rand(0, 1),
                'foto_ktp' => 'ktp/placeholder-ktp.jpg'
            ]);
        }

        // 5. Assign 15 Houses to Permanent Residents
        $currentMonth = (int)date('n');
        $currentYear = (int)date('Y');

        for ($i = 0; $i < 15; $i++) {
            $house = $houses[$i];
            $resident = $residentsTetap[$i];

            DB::table('house_residents')->insert([
                'house_id' => $house->id,
                'resident_id' => $resident->id,
                'tanggal_masuk' => Carbon::now()->subYears(rand(1, 5))->format('Y-m-d'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $house->update(['status' => 'dihuni']);
            $resident->update(['alamat' => $house->alamat]);

            // Generate payments for the last 6 months
            $this->generateBillings($house->id, $resident->id, $feeKebersihan->id, $feeSatpam->id, 6, $currentMonth, $currentYear, true);
        }

        // 6. Assign the remaining 5 houses
        // - 2 Houses occupied by kontrak right now
        // - 1 House occupied by kontrak right now, with history of previous kontrak
        // - 2 Houses empty right now, but has history of previous kontrak
        $kontrakIdx = 0;

        // House 16 & 17: occupied by kontrak
        for ($i = 15; $i <= 16; $i++) {
            $house = $houses[$i];
            $resident = $residentsKontrak[$kontrakIdx++];
            DB::table('house_residents')->insert([
                'house_id' => $house->id,
                'resident_id' => $resident->id,
                'tanggal_masuk' => Carbon::now()->subMonths(rand(2, 6))->format('Y-m-d'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $house->update(['status' => 'dihuni']);
            $resident->update(['alamat' => $house->alamat]);
            $this->generateBillings($house->id, $resident->id, $feeKebersihan->id, $feeSatpam->id, 3, $currentMonth, $currentYear, false);
        }

        // House 18: currently occupied by kontrak, but has past history
        $house18 = $houses[17];
        // Past resident
        $pastResident = $residentsKontrak[$kontrakIdx++];
        DB::table('house_residents')->insert([
            'house_id' => $house18->id,
            'resident_id' => $pastResident->id,
            'tanggal_masuk' => Carbon::now()->subMonths(12)->format('Y-m-d'),
            'tanggal_keluar' => Carbon::now()->subMonths(4)->format('Y-m-d'),
            'is_active' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        // Current resident
        $currentResident18 = $residentsKontrak[$kontrakIdx++];
        DB::table('house_residents')->insert([
            'house_id' => $house18->id,
            'resident_id' => $currentResident18->id,
            'tanggal_masuk' => Carbon::now()->subMonths(3)->format('Y-m-d'),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $house18->update(['status' => 'dihuni']);
        $currentResident18->update(['alamat' => $house18->alamat]);
        $this->generateBillings($house18->id, $currentResident18->id, $feeKebersihan->id, $feeSatpam->id, 3, $currentMonth, $currentYear, false);

        // House 19 & 20: Empty now, but had past residents
        for ($i = 18; $i <= 19; $i++) {
            $house = $houses[$i];
            $pastRes = $residentsKontrak[$kontrakIdx++];
            DB::table('house_residents')->insert([
                'house_id' => $house->id,
                'resident_id' => $pastRes->id,
                'tanggal_masuk' => Carbon::now()->subMonths(8)->format('Y-m-d'),
                'tanggal_keluar' => Carbon::now()->subMonths(1)->format('Y-m-d'),
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $house->update(['status' => 'tidak_dihuni']);
        }

        // 7. Generate some general Expenses (Pengeluaran)
        $expenseTypes = ['Perbaikan Jalan', 'Perbaikan Selokan', 'Gaji Satpam', 'Operasional'];
        
        for ($i = 0; $i < 6; $i++) {
            $m = $currentMonth - $i;
            $y = $currentYear;
            if ($m <= 0) {
                $m += 12;
                $y--;
            }

            // Fixed monthly expenses
            Expense::create([
                'kategori' => 'Gaji Satpam',
                'deskripsi' => 'Gaji Satpam Bulan ' . $m,
                'nominal' => 2000000,
                'tanggal' => Carbon::createFromDate($y, $m, 5)->format('Y-m-d'),
                'bulan' => $m,
                'tahun' => $y,
            ]);

            Expense::create([
                'kategori' => 'Operasional',
                'deskripsi' => 'Token Listrik Pos Bulan ' . $m,
                'nominal' => 150000,
                'tanggal' => Carbon::createFromDate($y, $m, 2)->format('Y-m-d'),
                'bulan' => $m,
                'tahun' => $y,
            ]);

            // Random occasional expense
            if (rand(0, 1)) {
                $kategori = $expenseTypes[array_rand(['Perbaikan Jalan', 'Perbaikan Selokan'])];
                Expense::create([
                    'kategori' => $kategori,
                    'deskripsi' => 'Biaya ' . $kategori,
                    'nominal' => rand(5, 15) * 100000,
                    'tanggal' => Carbon::createFromDate($y, $m, rand(10, 25))->format('Y-m-d'),
                    'bulan' => $m,
                    'tahun' => $y,
                ]);
            }
        }
    }

    private function generateBillings($houseId, $residentId, $feeKebersihanId, $feeSatpamId, $monthsCount, $currentMonth, $currentYear, $permanent)
    {
        for ($i = 0; $i < $monthsCount; $i++) {
            $m = $currentMonth - $i;
            $y = $currentYear;
            if ($m <= 0) {
                $m += 12;
                $y--;
            }

            $status = ($i === 0 && rand(0, 1)) ? 'belum_bayar' : 'lunas';

            Billing::create([
                'house_id' => $houseId,
                'resident_id' => $residentId,
                'fee_type_id' => $feeKebersihanId,
                'bulan' => $m,
                'tahun' => $y,
                'nominal' => 15000,
                'status' => $status,
                'updated_at' => $status === 'lunas' ? Carbon::createFromDate($y, $m, rand(1, 10)) : now(),
            ]);

            Billing::create([
                'house_id' => $houseId,
                'resident_id' => $residentId,
                'fee_type_id' => $feeSatpamId,
                'bulan' => $m,
                'tahun' => $y,
                'nominal' => 100000,
                'status' => $status,
                'updated_at' => $status === 'lunas' ? Carbon::createFromDate($y, $m, rand(1, 10)) : now(),
            ]);
        }
    }
}
