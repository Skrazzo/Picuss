<?php

namespace App\Http\Controllers;

use App\Models\Picture;
use App\Models\ShareImages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ShareImagesController extends Controller
{
    public function create(Request $req) {
        $validator = Validator::make($req->all(), [
            'imageId' => 'required|exists:pictures,public_id'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        } 

        //process the request
        $data = $validator->valid(); // validated data
        $picture = Picture::where('public_id', $data['imageId'])->first();

        // Check security
        if (auth()->user()->id != $picture->user_id) {
            return response('You don\'t have the permission to view this image', 403);
        }

        // Sending back data
        $response  = [
            'message' => '',
            'title' => '',
            'public' => false,
        ];

        if ($picture->sharedImage()->count() >= 1)  {
            $picture->sharedImage()->delete();

            $response['title'] = 'Revoked access';
            $response['message'] = 'Your image is not publicly accessible anymore';
        } else {
            $shared = $picture->sharedImage()->create([
                'user_id' => auth()->id()
            ]);

            if($shared) {
                $response['title'] = 'Granted access';
                $response['message'] = 'Your image is now publicly accessible to anyone';
                $response['public'] = true;
                $response['link'] = route('share.image.page', $shared->picture_id);
            }
        }
        

        return response()->json($response);
    }

    public function view(Picture $picture) {
        $share = $picture->sharedImage()->first();
        if(!$share) {
            return abort(404);
        }

        $SERVER_THUMBNAILS_DISK = env('SERVER_THUMBNAILS_DISK', 'thumbnails');
        $thumbDisk = Storage::disk($SERVER_THUMBNAILS_DISK);

        $share->views = $share->views + 1;
        $share->save();

        return Inertia::render('ViewSharedImage', [
            'thumb' => 'data:image/webp;base64,' . base64_encode($thumbDisk->get($picture->image)),
            'picture' => [
                'id' => $picture->public_id,
                'size' => round($picture->size, 3),
                'name' => $picture->image,
            ],
        ]);

    }

    public function get(Picture $picture) {
        if($picture->sharedImage()->count() == 0) {
            return abort(404);
        }

        $SERVER_IMAGE_DISK = env('SERVER_IMAGE_DISK', 'images');
        $imageDisk = Storage::disk($SERVER_IMAGE_DISK);

        if (!$imageDisk->exists($picture->image)) {
            return response('Could not find the image on local disk', 404);
        }

        return $imageDisk->response($picture->image);
    }

    public function download(Picture $picture) {
        $share = $picture->sharedImage()->first();
        if(!$share) {
            return abort(404);
        }

        $SERVER_IMAGE_DISK = env('SERVER_IMAGE_DISK', 'images');
        $imageDisk = Storage::disk($SERVER_IMAGE_DISK);

        $share->downloads = $share->downloads + 1;
        $share->save();

        if($imageDisk->exists($picture->image)) {
            return response()->download($imageDisk->path($picture->image));
        }

        return abort(404);
    }

    public function manage_index() {
        $userId = auth()->id();
        
        $links = ShareImages::where('user_id', $userId)->get();
        dd($links);

        return Inertia::render('ManageLinks');
    }
}
