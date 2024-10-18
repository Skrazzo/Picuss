<?php

namespace App\Console\Commands;

use App\Helpers\Disks;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DeleteAllCreated extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "pictures:delete-generated {--user=}";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Deletes all previously created images, thumbnails and scaled down images, write --user=1 to select user by id";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user_id = $this->option("user");

        // Get storage disks
        $halfDisk = Disks::half();
        $thumbDisk = Disks::thumb();

        $thumbs = $thumbDisk->allFiles();
        $halfs = $halfDisk->allFiles();

        $count = 0;

        if ($user_id) {
            $user = User::find($user_id);

            if (!$user) {
                $this->error("Could not find specified user");
                die();
            }

            $pictures = $user->picture()->where("hidden", false)->pluck("image");

            foreach ($pictures as $pic) {
                $thumbDisk->delete($pic);
                $halfDisk->delete($pic);
                $count += 2;
            }
        } else {
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
        }

        echo $count . " pictures were deleted\n";
    }
}
