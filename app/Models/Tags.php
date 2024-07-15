<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tags extends Model
{
    protected $fillable = [
        'user_id',
        'name',
    ];

    public function user(){
        return $this->belongsTo(\App\Models\User::class);
    }
    public function share() {
        return $this->hasOne(\App\Models\ShareTags::class);
    }

    protected $casts = [
        'tags' => 'array'
    ];

    use HasFactory;
}
