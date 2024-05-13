<?php

namespace App\Observers;

use App\Models\Picture;
use Vinkla\Hashids\Facades\Hashids;

class PictureObserver
{
    /**
     * Handle the Picture "created" event.
     */
    public function created(Picture $picture): void
    {
        $picture->public_id = Hashids::encode($picture->id);
        $picture->save();
    }

    /**
     * Handle the Picture "updated" event.
     */
    public function updated(Picture $picture): void
    {
        //
    }

    /**
     * Handle the Picture "deleted" event.
     */
    public function deleted(Picture $picture): void
    {
        //
    }

    /**
     * Handle the Picture "restored" event.
     */
    public function restored(Picture $picture): void
    {
        //
    }

    /**
     * Handle the Picture "force deleted" event.
     */
    public function forceDeleted(Picture $picture): void
    {
        //
    }
}
