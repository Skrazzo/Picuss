<?php

namespace App\Console\Commands;

use App\Helpers\Disks;
use App\Helpers\Users;
use App\Models\User;
use Exception;
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
     * Delete users by their ids separated by ','
     *
     * @throws Exception
     */
    public function handle()
    {
        $users = $this->argument("users");
        $ids = explode(",", $users);

        foreach ($ids as $id) {
            try {
                Users::delete($id);
                $this->info("User with id $id was deleted.");
            } catch (Exception $e) {
                $this->error($e->getMessage());
            }
        }
    }
}
