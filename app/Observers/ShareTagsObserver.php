<?php

namespace App\Observers;

use App\Models\ShareTags;
use Vinkla\Hashids\Facades\Hashids;

class ShareTagsObserver
{
    public function created(ShareTags $tag): void
    {
        $tag->tag_public_id = Hashids::encode($tag->id);
        $tag->save();
    }
}
