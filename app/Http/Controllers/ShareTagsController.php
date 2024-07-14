<?php

namespace App\Http\Controllers;

use App\Models\Picture;
use App\Models\ShareTags;
use App\Models\Tags;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ShareTagsController extends Controller
{
    public function view(ShareTags $tag) {
        return Inertia::render('Components/SharedTagView/Index', [
            'title' => 'Shared images',
            'id' => $tag->tag_public_id,
        ]);
    }

    public function get(ShareTags $tag, $page) {
        $allDBPictures = Picture::whereJsonContains('tags', $tag->tags_id)->get();
        
        $pictureCount = $allDBPictures->count();
        $size = round($allDBPictures->sum('size'), 3); // All image size
        

        $perPage = env('perPage', 40);
        $maxPages = ceil($pictureCount / $perPage);

        // Check for pages
        if ($page < 1 || $page > $maxPages) {
            return response('Too many pages requsted', 404);
        }

        // Get pages
        $DBpictures = Picture::whereJsonContains('tags', $tag->tags_id)
            ->orderBy('created_at', 'DESC')
            ->skip($perPage * ($page - 1))
            ->take($perPage)
            ->get();

        // Get thumbnail disk
        $thumbEnv = env('SERVER_THUMBNAILS_DISK', 'thumbnails');
        $thumbDisk = Storage::disk($thumbEnv);

        // Filter pictures, and return only needed information
        $pictures = [];
        foreach($DBpictures as $pic) {
            // Get thumbnail for the picture
            $thumb = 'data:image/webp;base64';
            if ($thumbDisk->exists($pic->image)) {
                $thumb = 'data:image/webp;base64,' . base64_encode($thumbDisk->get($pic->image));
            }

            $pictures[] = [
                'id' => $pic->public_id,
                'size' => round($pic->size, 3),
                'width' => $pic->width,
                'height' => $pic->height,
                'name' => $pic->image,
                'thumb' => $thumb,
            ];
        }

        // Download settings
        $maxZipSize = env('maxZipSize', 25);
        $download = [
            'allowed' => ($size > $maxZipSize) ? false : true,
            'size' => $size
        ];
        $info = [
            'owner' => User::find($tag->user_id)->first()['username'],
            'tag_name' => $tag->tag()->first('name')->name,
        ];

        return compact('pictureCount', 'maxPages', 'pictures', 'download', 'info');
    }

    
    public function shareTags(Request $req) {
        $validator = Validator::make($req->all(), [
            'tags' => 'required|array'
        ]);
        
        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        } 
        
        //process the request
        $data = $validator->valid(); // validated data
        
        
        // $id => tag id
        foreach ($data['tags'] as $id) { 
            $tag = Tags::find($id);

            // Check if tag exists and belongs to a user
            if (!$tag) continue;
            if ($tag->user_id !== auth()->id()) continue;
            if ($tag->share()->first()) continue ; // Share already exists
            
            $tag->share()->create(['user_id' => auth()->id()]);
        }

    }

    public function unshareTags(Request $req) {
        $validator = Validator::make($req->all(), [
            'tags' => 'required|array'
        ]);
        
        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        } 
        
        //process the request
        $data = $validator->valid(); // validated data
        
        
        // $id => tag id
        foreach ($data['tags'] as $id) { 
            $tag = ShareTags::where('tag_public_id', $id)->first();

            // Check if tag exists and belongs to a user
            if (!$tag) continue;
            if ($tag->user_id !== auth()->id()) continue;
            $tag->delete();
        }
    }
}
