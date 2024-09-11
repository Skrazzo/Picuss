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

    /**
     * @retruns disks [image, half, thumbnail]
     */
    public static function allDisks()
    {
        $imageEnv = env("SERVER_IMAGE_DISK", "images");
        $halfEnv = env("SERVER_IMAGE_HALF_DISK", "half_images");
        $thumbEnv = env("SERVER_THUMBNAILS_DISK", "thumbnails");

        return [Storage::disk($imageEnv), Storage::disk($halfEnv), Storage::disk($thumbEnv)];
    }
}
