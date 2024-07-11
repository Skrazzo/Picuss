<?php

namespace App\Console\Commands;

use App\Models\Picture;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class fixDimensions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:fix-dimensions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command to take and add sizes to images that are already in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $imageEnv = env('SERVER_IMAGE_DISK', 'images');
        $imageDisk = Storage::disk($imageEnv);

        $pictures = Picture::all();

        foreach($pictures as $pic) {
            $size = getimagesize($imageDisk->path($pic->image));
            $pic->width = $size[0];
            $pic->height = $size[1];
            $pic->save();
        }

        return 0;
    }
}
