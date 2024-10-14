<?php

namespace App\Helpers;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Storage;

class Disks
{
    public static function image()
    {
        $imageEnv = env("SERVER_IMAGE_DISK", "images");
        return Storage::disk($imageEnv);
    }

    public static function half()
    {
        $halfEnv = env("SERVER_IMAGE_HALF_DISK", "half_images");
        return Storage::disk($halfEnv);
    }

    public static function thumb()
    {
        $thumbEnv = env("SERVER_THUMBNAILS_DISK", "thumbnails");
        return Storage::disk($thumbEnv);
    }

    public static function tmp()
    {
        $tmpEnv = env("SERVER_TMP_ZIP_DISK", "tmp");
        return Storage::disk($tmpEnv);
    }

    /**
     * @return array<\Illuminate\Contracts\Filesystem\Filesystem> - array of all disks [image, half, thumbnail]
     */
    public static function allDisks(): array
    {
        $imageEnv = env("SERVER_IMAGE_DISK", "images");
        $halfEnv = env("SERVER_IMAGE_HALF_DISK", "half_images");
        $thumbEnv = env("SERVER_THUMBNAILS_DISK", "thumbnails");

        return [
            Storage::disk($imageEnv), // image
            Storage::disk($halfEnv), // half
            Storage::disk($thumbEnv), // thumbnail
        ];
    }

    /**
     * Calculate how much space a user has used in MB. From database
     *
     * @param int $id
     * @return float
     * @throws Exception
     */
    public static function userUsedSpace($id)
    {
        $user = User::find($id);
        if (!$user) {
            throw new Exception("User not found");
        }

        return round($user->picture()->sum("size"), 3);
    }

    public static function totalUsedSpace($id)
    {
        $user = User::find($id);
        if (!$user) {
            throw new Exception("User not found");
        }

        $storages = self::allDisks();
        $pictures = $user->picture()->get();

        $fileSize = 0;
        foreach ($storages as $storage) {
            foreach ($pictures as $pic) {
                if ($storage->exists($pic->image)) {
                    $fileSize += $storage->size($pic->image);
                }
            }
        }

        return round($fileSize / 1024 / 1024, 3);
    }
}
