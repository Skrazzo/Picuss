<?php

namespace App\Http\Controllers;

use App\Models\Picture;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use ZipArchive;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;

class PictureController extends Controller
{
    public function upload_index(Request $req){
        return Inertia::render('Upload');
    }

    public function dashboard_index(Request $req) {
        return Inertia::render('Dashboard');
    }

    public function get_image(Picture $picture) {
        $SERVER_IMAGE_DISK = env('SERVER_IMAGE_DISK', 'images');
        if (!Storage::disk($SERVER_IMAGE_DISK)->exists($picture->image)) {
            return response('Could not find the image on local disk', 404);
        }

        if (auth()->user()->id != $picture->user_id) {
            return response('You don\'t have the permission to view this image', 403);
        }

        return Storage::disk($SERVER_IMAGE_DISK)->response($picture->image);
        
    }

    public function get_resized_images(Request $req, $page) {
        $SERVER_IMAGE_DISK = env('SERVER_IMAGE_DISK', 'images');
        $SERVER_THUMBNAILS_DISK = env('SERVER_THUMBNAILS_DISK', 'thumbnails');

        if ($page < 1) {
            return response()->json([ 'message' => 'Page cannot be below 0' ], 422);
        }

        // Picture per page
        // $perPage = 80;
        $perPage = 40;
        $skip = ($page - 1) * $perPage;
        $pictures = $req->user()->picture()->orderBy('created_at', 'DESC')->skip($skip)->take($perPage)->get();
        
        
        $rtn_arr = [ 'totalPages' => ceil($req->user()->picture()->count() / $perPage) , 'images' => [] ];
        foreach ($pictures as $pic) {
            $path = Storage::disk($SERVER_IMAGE_DISK)->path($pic->image);
            $thumbDISK = Storage::disk($SERVER_THUMBNAILS_DISK);

            if (!$thumbDISK->exists($pic->image)) { // need to create new thumbnail and save it to the disk
                $manager = new ImageManager(new Driver());
                
                // Check if image's resolution is too big, then skip making thumbnail for it
                $imageSize = getimagesize($path);
                if ($imageSize[0] > 6800 || $imageSize[1] > 6800) {
                    // Add image without a thumbnail
                    $rtn_arr['images'][] = [
                        'id' => $pic->public_id,
                        'name' => $pic->image,
                        'size' => round($pic->size, 3),
                        'tags' => $pic->tags,
                        'uploaded' => $pic->created_at,
                        'uploaded_ago' => str_replace('before', 'ago', $pic->created_at->diffForHumans(now()) ),
                        'thumb' => 'data:image/webp;base64,',
                        
                    ];

                    continue;
                }
                
                $image = $manager->read($path);
                $image->scaleDown(width: 20);
                // $image->pixelate(8);

                $image->save($thumbDISK->path($pic->image)); // Save image to the local path
            }
            
            $rtn_arr['images'][] = [
                'id' => $pic->public_id,
                'name' => $pic->image,
                'size' => round($pic->size, 3),
                'tags' => $pic->tags,
                'uploaded' => $pic->created_at,
                'uploaded_ago' => str_replace('before', 'ago', $pic->created_at->diffForHumans(now()) ),
                'thumb' => 'data:image/webp;base64,' . base64_encode($thumbDISK->get($pic->image))
            ];
            
        }
        
        return response()->json($rtn_arr);
    }

    public function upload(Request $req){
        $data = $req->validate([
            'zip' => 'required|file|mimes:zip|max:512000', // 500MB
            'tags' => 'required|json'
        ]);

        $SERVER_TMP_ZIP_DISK = env('SERVER_TMP_ZIP_DISK', 'tmp');
        $SERVER_IMAGE_DISK = env('SERVER_IMAGE_DISK', 'images');
        $tmpZipFile = '';

        if ($req->file('zip')->isValid()) {
            $file = $req->file('zip');
            $tmpZipFile = Storage::disk($SERVER_TMP_ZIP_DISK)->put('', $file);
        }else{
            return response()->json([ 'message' => 'File is not valid' ], 400);
        }

        // Check if zip file exists
        if (!Storage::disk($SERVER_TMP_ZIP_DISK)->exists($tmpZipFile)) {
            // This error really shouldn't appear, but im making it just in case
            return response()->json([ 'message' => 'Temporary zip file does not exist!'], 404);
        }

        // Open zip file
        $zipPath = Storage::disk($SERVER_TMP_ZIP_DISK)->path($tmpZipFile);

        $zip = new ZipArchive();
        $zipStatus = $zip->open($zipPath);

        // Check if zip has been opened properly
        if (!$zipStatus) {
            return response()->json([ 'message' => 'Could not open zip file'], 500);
        }

        // get all zip file contents
        $zipFiles = [];
        for ($i = 0; $i < $zip->count(); $i++){
            $zipFiles[] = $zip->getNameIndex($i);
        }

        $noOverwrite = true; // This variable determines if any files will get overwritten
        foreach ($zipFiles as $file) {
            if (Storage::disk($SERVER_IMAGE_DISK)->exists($file)) {
                $noOverwrite = false;
                break;
            }
        }

        // Check if any of zip files were found in the image directory
        if (!$noOverwrite) {
            return response()->json([ 'message' => "Files exist in destination directory!"], 409);
        }

        // Extract zip file
        $success = $zip->extractTo(Storage::disk($SERVER_IMAGE_DISK)->path(''));
        if (!$success) {
            return response()->json([ 'message' => "Files could not be extracted!" ], 500);
        }

        // close zip
        $zip->close();

        // Delete zip file
        $deleted = Storage::disk($SERVER_TMP_ZIP_DISK)->delete($tmpZipFile);
        if (!$deleted) {
            return response()->json([ 'message' => "Could not delete temporary zip file!"], 500);
        }

        // Check if all files are extracted successfully, and if they're then add to the database
        $allExtracted = true;
        foreach ($zipFiles as $file) {
            if (!Storage::disk($SERVER_IMAGE_DISK)->exists($file)) {
                $allExtracted = false;
                continue;
            }

            $id = $req->user()->picture()->create([
                'image' => $file,
                'tags' => json_decode($data['tags']), // tag ids
                'size' => Storage::disk($SERVER_IMAGE_DISK)->size($file) / 1048576 // convert to MB
            ]);

            if (!$id) { // check if database record was created successfully
                return response()->json([ 'message' => 'Could not create a database record!' ], 500);
            }
        }

        if (!$allExtracted) {
            return response()->json([ 'message' => 'Not all files could be extracted successfully!'], 500);
        }

        return response()->json([ 'message' => 'All images were uploaded successfully' ], 201);
    }

    public function edit_tags(Picture $picture, Request $req) {

        $validator = Validator::make($req->all(), [
            'tags' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 400);
        } else {
            //process the request
            $data = $validator->valid(); // validated data
            $picture->tags = $data['tags'];

            if($picture->save()) {
                return response('saved');
            }
        }

        return response('Something went wrong, and couln\'dnt save tags', 500);
    }

    function delete_picture (Picture $picture) {

        $SERVER_THUMBNAILS_DISK = env('SERVER_THUMBNAILS_DISK', 'thumbnails');
        $SERVER_IMAGE_DISK = env('SERVER_IMAGE_DISK', 'images');

        Storage::disk($SERVER_IMAGE_DISK)->delete($picture->image);
        Storage::disk($SERVER_THUMBNAILS_DISK)->delete($picture->image);
        
        $picture->delete();
        
        return response('Picture deleted');
    }
}
