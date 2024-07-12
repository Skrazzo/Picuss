<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShareTags extends Model
{
    protected $fillable = [
        'tag_public_id',
        'user_id',
    ];

    public function tag() {
        return $this->belongsTo(\App\Models\Tags::class);
    }

    use HasFactory;
}
