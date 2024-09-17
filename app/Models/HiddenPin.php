<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HiddenPin extends Model
{
    protected $fillable = ["user_id", "hash"];
    protected $casts = [
        "hash" => "hashed",
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    use HasFactory;
}
