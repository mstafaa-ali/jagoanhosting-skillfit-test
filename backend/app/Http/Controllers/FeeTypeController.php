<?php

namespace App\Http\Controllers;

use App\Models\FeeType;
use Illuminate\Http\Request;

class FeeTypeController extends Controller
{
    public function index()
    {
        return FeeType::all();
    }

    public function update(Request $request, FeeType $feeType)
    {
        $data = $request->validate([
            'nominal' => 'required|numeric',
            'deskripsi' => 'sometimes|string',
        ]);

        $feeType->update($data);
        return $feeType;
    }
}
