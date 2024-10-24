<?php

namespace App\Console\Commands;

use App\Models\Picture;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;

class GenerateAllPictures extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "app:generate-all-pictures";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Generates thumbnails and half images for all picture who dont have them, It also checks if images exist locally, or only in the database. Delets unnecessary images.";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ouputConsole = true;

        $thumbWidth = env("thumbWidth", 40);
        $scalePercent = env("scaledDownImages", 20);

        // Get storage env variables
        $imageEnv = env("SERVER_IMAGE_DISK", "images");
        $halfEnv = env("SERVER_IMAGE_HALF_DISK", "half_images");
        $thumbEnv = env("SERVER_THUMBNAILS_DISK", "thumbnails");

        // Get storage disks
        $imageDisk = Storage::disk($imageEnv);
        $halfDisk = Storage::disk($halfEnv);
        $thumbDisk = Storage::disk($thumbEnv);

        if ($ouputConsole) {
            \Log::channel("console")->info("Run started");
        }

        $createdCount = 0;
        $deletedCount = 0;
        $delLocalCount = 0; // Deleted locally
        $pictures = Picture::where("hidden", false)->get();

        foreach ($pictures as $picture) {
            if (!$halfDisk->exists($picture->image)) {
                // Create half image

                // Check if image exists
                if (!$imageDisk->exists($picture->image)) {
                    echo $picture->image . " Image does not exist!!! \n";

                    // Delete from database
                    $picture->delete();
                    $deletedCount++;

                    continue;
                }

                // Scale down original image
                $path = $imageDisk->path($picture->image);
                $imageSize = getimagesize($path);
                $resultPixels = ($scalePercent * $imageSize[0]) / 100;

                // Initiate scaling down, and save the image
                $manager = new ImageManager(new Driver());
                $image = $manager->read($path);
                $image->scaleDown(width: $resultPixels);
                $image->save($halfDisk->path($picture->image));

                if ($ouputConsole) {
                    echo $picture->image . " created half image\n";
                }
                $createdCount++;
            }

            if (!$thumbDisk->exists($picture->image)) {
                // Create thumbnail

                // Check if image exists
                if (!$imageDisk->exists($picture->image)) {
                    echo $picture->image . " Image does not exist!!! \n";

                    // Delete from database
                    $picture->delete();
                    $deletedCount++;

                    continue;
                }

                // Initiate scaling down, and save the image
                $manager = new ImageManager(new Driver());
                $image = $manager->read($imageDisk->path($picture->image));
                $image->scaleDown(width: $thumbWidth);
                $image->save($thumbDisk->path($picture->image));

                if ($ouputConsole) {
                    echo $picture->image . " created thumbnail\n";
                }
                $createdCount++;
            }
        }

        // Check images locally
        $allImages = $imageDisk->allfiles();
        foreach ($allImages as $img) {
            $pic = Picture::where("image", $img)->first();
            if (!$pic) {
                // Picture is not found in database

                // Delete pictures from image, half, and thumbnails
                $imageDisk->delete($img);
                $halfDisk->delete($img);
                $thumbDisk->delete($img);

                $delLocalCount++;
            }
        }

        if ($ouputConsole) {
            echo $createdCount . " Images were created, aka for " . $createdCount / 2 . " records\n";
            \Log::channel("console")->info("Images were created, aka for " . $createdCount / 2 . " records");
        }
        if ($ouputConsole) {
            echo $deletedCount . " Images were deleted, because existed only in database \n";
            \Log::channel("console")->info("Images were deleted, because existed only in database");
        }
        if ($ouputConsole) {
            echo $delLocalCount . " Images were deleted, because existed only locally \n";
            \Log::channel("console")->info("Images were deleted, because existed only locally");
        }

        if ($ouputConsole) {
            \Log::channel("console")->info("Run finished");
        }
    }
}
