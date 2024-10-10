<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ["username", "password", "is_admin"];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = ["password", "remember_token"];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            "password" => "hashed",
        ];
    }

    public function picture()
    {
        return $this->hasMany(\App\Models\Picture::class);
    }

    public function tag()
    {
        return $this->hasMany(\App\Models\Tags::class);
    }

    public function sharedImage()
    {
        return $this->hasMany(\App\Models\ShareImages::class);
    }

    public function pin()
    {
        return $this->hasOne(\App\Models\HiddenPin::class);
    }

    public function isAdmin()
    {
        if ($this->is_admin) {
            return true;
        }

        return false;
    }

    protected $appends = ["created_ago", "images_count", "images_size", "tags_count"];
    #region attribute functions
    public function getCreatedAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getImagesCountAttribute()
    {
        return $this->picture()->count();
    }

    public function getImagesSizeAttribute()
    {
        return round($this->picture()->sum("size"), 3); // In megabytes
    }

    public function getTagsCountAttribute()
    {
        return $this->tag()->count();
    }

    #endregion
}
