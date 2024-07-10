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
    protected $signature = 'app:generate-all-pictures';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generates thumbnails and half images for all picture who dont have them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ouputConsole = true;

        $thumbWidth = env('thumbWidth', 40);
        $scalePercent = env('scaledDownImages', 20);
        
        // Get storage env variables
        $imageEnv = env('SERVER_IMAGE_DISK', 'images');
        $halfEnv = env('SERVER_IMAGE_HALF_DISK', 'half_images');
        $thumbEnv = env('SERVER_THUMBNAILS_DISK', 'thumbnails');
        
        // Get storage disks
        $imageDisk = Storage::disk($imageEnv);
        $halfDisk = Storage::disk($halfEnv);
        $thumbDisk = Storage::disk($thumbEnv);
        
        $createdCount = 0;
        $deletedCount = 0;
        $pictures = Picture::all();
        
        
        foreach ($pictures as $picture) {
            
            if(!$halfDisk->exists($picture->image)) { // Create half image

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
                $resultPixels = $scalePercent * $imageSize[0] / 100;
                

                // Initiate scaling down, and save the image
                $manager = new ImageManager(new Driver());
                $image = $manager->read($path);
                $image->scaleDown(width: $resultPixels);
                $image->save($halfDisk->path($picture->image));

                if($ouputConsole) echo $picture->image . " created half image\n";
                $createdCount ++;
            }


            if(!$thumbDisk->exists($picture->image)) { // Create thumbnail

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

                if($ouputConsole) echo $picture->image . " created thumbnail\n";
                $createdCount ++;
            }

        
        }
        
        if($ouputConsole) echo $createdCount . " Images were created \n";
        if($ouputConsole) echo $deletedCount . " Images were deleted, because existed only in database \n";

    }
}
