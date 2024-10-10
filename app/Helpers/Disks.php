<?php

namespace App\Helpers;

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

    public static function userUsedSpace()
    {
        // TODO: Create function that counts up user used space from real images
    }

    public static function totalUsedSpace()
    {
        // TODO: Create function that counts up total used space from real images
    }
}
