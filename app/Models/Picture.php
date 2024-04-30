<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Picture extends Model
{
    protected $fillable = [
        'user_id',
        'image',
        'tags',
        'name'
    ];

    protected $casts = [
        'tags' => 'json'
    ];

    use HasFactory;
}
