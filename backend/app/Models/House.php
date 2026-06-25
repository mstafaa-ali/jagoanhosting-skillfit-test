<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    protected $guarded = ['id'];

    public function residents()
    {
        return $this->belongsToMany(Resident::class, 'house_residents')->withPivot('tanggal_masuk', 'tanggal_keluar', 'is_active')->withTimestamps();
    }

    public function billings()
    {
        return $this->hasMany(Billing::class);
    }
}
