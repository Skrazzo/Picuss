<?php

namespace App\Helpers;

use App\Models\Picture;
use App\Models\Tags;

class TagsHelper
{
    /**
     * Used to check if tag can be deleted without deleting pictures
     * Returns true, tag can be deleted without deleting pictures, false otherwise
     */
    public static function CanSoftDelete($tag_id)
    {
        $tag = Tags::find($tag_id);
        if (!$tag) {
            return false;
        }

        $pictures = Picture::whereJsonContains("tags", $tag->id)->get();

        foreach ($pictures as $pic) {
            if (count($pic->tags) == 1) {
                return false;
            }
        }

        return true;
    }
}
