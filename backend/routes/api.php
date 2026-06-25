<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ResidentController;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FeeTypeController;
use App\Http\Controllers\ReportController;

// ponytail: skipping auth middleware for now to test APIs cleanly
Route::apiResource('residents', ResidentController::class);

Route::apiResource('houses', HouseController::class);
Route::post('houses/{house}/assign-resident', [HouseController::class, 'assignResident']);
Route::post('houses/{house}/remove-resident', [HouseController::class, 'removeResident']);

Route::get('billings', [BillingController::class, 'index']);
Route::post('billings', [BillingController::class, 'store']);
Route::put('billings/{billing}', [BillingController::class, 'update']);
Route::post('billings/generate', [BillingController::class, 'generate']);
Route::post('billings/bulk-pay', [BillingController::class, 'bulkPay']);

Route::apiResource('expenses', ExpenseController::class);

Route::apiResource('fee-types', FeeTypeController::class)->only(['index', 'update']);

Route::get('reports/summary', [ReportController::class, 'summary']);
Route::get('reports/monthly', [ReportController::class, 'monthly']);
