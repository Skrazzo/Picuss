<?php

namespace App\Console\Commands;

use App\Helpers\Disks;
use App\Models\User;
use Illuminate\Console\Command;

class DeleteUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "users:delete {users}";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Delete users by their ids separated by ','";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = $this->argument("users");
        $ids = explode(",", $users);

        $disks = Disks::allDisks();

        foreach ($ids as $id) {
            $user = User::find($id);

            if (!$user) {
                $this->error("User with id $id not found.");
                continue;
            }

            // Delete every picture
            $pictures = $user->picture()->get();
            foreach ($pictures as $picture) {
                foreach ($disks as $disk) {
                    $success = $disk->delete($picture->image);
                    if (!$success) {
                        $this->error("Could not delete $user->username $picture->image from $disk disk.");
                    }
                }

                $picture->delete();
            }

            try {
                $user->sharedImage()->delete();
                $user->tag()->delete();
                $user->pin()->delete();
                $user->delete();
            } catch (\Exception $e) {
                $this->error($e->getMessage());
            }

            $this->info("User $user->username deleted.");
        }

        /*
    
            Delete all images from all storages
            all shared tags
            all shared pics
            all pic records
            pin code
            

        */
    }
}
