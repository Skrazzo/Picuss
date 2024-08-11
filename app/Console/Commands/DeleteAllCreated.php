<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DeleteAllCreated extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "app:delete-all-created";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Deletes all previously created images, thumbnails and scaled down images";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get storage env variables
        $imageEnv = env("SERVER_IMAGE_DISK", "images");
        $halfEnv = env("SERVER_IMAGE_HALF_DISK", "half_images");
        $thumbEnv = env("SERVER_THUMBNAILS_DISK", "thumbnails");

        // Get storage disks
        // $imageDisk = Storage::disk($imageEnv);
        $halfDisk = Storage::disk($halfEnv);
        $thumbDisk = Storage::disk($thumbEnv);

        $thumbs = $thumbDisk->allFiles();
        $halfs = $halfDisk->allFiles();

        $count = 0;

        // Delete thumbnails
        foreach ($thumbs as $name) {
            $thumbDisk->delete($name);
            $count++;
        }

        // Delete scaled down pictures
        foreach ($halfs as $name) {
            $halfDisk->delete($name);
            $count++;
        }

        echo $count . " pictures were deleted\n";
    }
}
