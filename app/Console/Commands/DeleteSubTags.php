<?php

namespace App\Console\Commands;

use App\Models\Picture;
use App\Models\User;
use Illuminate\Console\Command;

class DeleteSubTags extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "pictures:delete-sub-tags {--user= : The user id}";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Command to remove all sub-tags for all pictures or specific user. To specify user add '--user 1'";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option("user");
        if ($userId) {
            $validator = \Validator::make(
                ["user_id" => $userId],
                [
                    "user_id" => "required|exists:users,id",
                ]
            );
            if ($validator->fails()) {
                $this->error("The given user id is not valid");
                return 1;
            }

            $pictures = Picture::where("user_id", $userId)->get();
        } else {
            $pictures = Picture::all();
        }

        $pictures->each(function ($picture) {
            $picture->sub_tags = null;
            $picture->save();
        });

        if ($userId) {
            $this->info("Sub tags reset for user " . User::find($userId)->first()["username"]);
        } else {
            $this->info("Sub tags reset");
        }
    }
}
