<?php

namespace App\Console\Commands;

use App\Helpers\Disks;
use App\Models\Picture;
use App\Models\Tags;
use App\Models\User;
use Illuminate\Console\Command;

class GetUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "users:get {--asc}";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Get users and their information";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ascSearch = $this->option("asc");

        $users = User::select("id", "username")
            ->orderBy("id", $ascSearch ? "asc" : "desc")
            ->get();

        $storages = Disks::allDisks();

        $tableHeaders = ["ID", "USERNAME", "IMAGE COUNT", "TAGS COUNT", "USED STORAGE (MB)"];
        $tableData = $users->map(function ($user) use ($storages) {
            $pictures = Picture::where("user_id", $user->id)->get();

            $fileSize = 0; // In bytes
            // Go through every picture and storage
            foreach ($pictures as $picture) {
                foreach ($storages as $storage) {
                    $fileSize += $storage->size($picture->image);
                }
            }

            // Convert to MB
            $fileSize = round($fileSize / 1024 / 1024, 2);

            return [
                $user->id,
                $user->username,
                $pictures->count(),
                Tags::where("user_id", $user->id)->count(),
                $fileSize,
            ];
        });

        $this->table($tableHeaders, $tableData);
    }
}
