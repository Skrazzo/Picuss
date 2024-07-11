<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Faker\Factory as Faker;

class fakeTags extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:fake-tags {amount}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates fake tags for a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        $amount = $this->argument('amount');
        
        for($i = 0; $i < count($users); $i++){
            echo $i . "] " . $users[$i]['username'] . "\n";
        }

        $selected = $this->ask('Select user for whom to create tags: ', 0);
        $validator = Validator::make([
            'idx' => $selected,
            'amount' => $amount,
        ], [
            'idx' => 'required|min:0|max:' . count($users) - 1 . '|integer',
            'amount' => 'required|min:1|max:200|integer',
        ]);


        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            
            return 1;
        }

        $user = $users[$selected];
        $faker = Faker::create();    

        for($i = 0; $i < $amount; $i++){
            $user->tag()->create([
                'user_id' => $selected,
                'name' => $faker->word(),
            ]);
        }

        
        echo "Created ". $amount ." tags for " . $user->username . "\n";
        return 0;
    }
}
