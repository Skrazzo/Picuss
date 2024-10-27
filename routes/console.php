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

Artisan::command("d", function () {
    $storage = Disks::half();
    $o = Encrypt::decrypt($storage, "image 1730036086243.webp", "123456");
    $storage->put("image 1730036086243.webp", $o);
});
