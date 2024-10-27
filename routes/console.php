<?php

use App\Helpers\Disks;
use App\Helpers\Encrypt;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command("inspire", function () {
    $this->comment(Inspiring::quote());
})
    ->purpose("Display an inspiring quote")
    ->hourly();

Artisan::command("enc {imageFile}", function ($imageFile) {
    $s = Disks::image();
    $out = Encrypt::encrypt($s, $imageFile, "123456");
    $s->put($imageFile, $out);
    $this->info("Done");
});

Artisan::command("dec {imageFile}", function ($imageFile) {
    $s = Disks::image();
    $out = Encrypt::decrypt($s, $imageFile, "123456");
    $s->put($imageFile, $out);
    $this->info("Done");
});

Artisan::command("is-enc {imageFile}", function ($imageFile) {
    $s = Disks::image();
    if (Encrypt::isEncrypted($s, $imageFile)) {
        $this->info("Encrypted");
    } else {
        $this->info("Not encrypted");
    }
});
