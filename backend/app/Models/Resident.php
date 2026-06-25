<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    protected $guarded = ['id'];

    public function houses()
    {
        return $this->belongsToMany(House::class, 'house_residents')->withPivot('tanggal_masuk', 'tanggal_keluar', 'is_active')->withTimestamps();
    }

    public function billings()
    {
        return $this->hasMany(Billing::class);
    }
}
