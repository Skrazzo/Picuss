<?php

namespace App\Models;

use App\Observers\PictureObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(PictureObserver::class)]
class Picture extends Model
{
    protected $fillable = [
        'public_id',
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
