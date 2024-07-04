<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShareImages extends Model
{
    protected $fillable = [
        'user_id',
        'picture_id',
        'views',
        'downloads',
    ];

    public function picture() {
        return $this->belongsTo(\App\Models\User::class);
    }

    use HasFactory;
}
