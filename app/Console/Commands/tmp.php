<?php

namespace App\Console\Commands;

use App\Helpers\TagsHelper;
use Illuminate\Console\Command;

class tmp extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "app:tmp {id}";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Command description";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $id = $this->argument("id");
        echo TagsHelper::CanSoftDelete($id) . "\n";
    }
}
