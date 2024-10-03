<?php

namespace App\Http\Controllers;

use App\Helpers\Disks;
use App\Helpers\Encrypt;
use App\Helpers\ValidateApi;
use App\Models\Picture;
use App\Models\Tags;
use Carbon\Carbon;
use Exception;
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
    public function upload_index(Request $req)
    {
        return Inertia::render("Upload", ["title" => "Upload"]);
    }

    public function dashboard_index(Request $req)
    {
        // Get preselected tag from ?tag=
        // Check if tag exists, and if it belongs to user

        $preSelected = $req->query("tag");
        if ($preSelected !== null) {
            $tag = Tags::find($preSelected);
            if (!$tag || $tag->user_id !== auth()->id()) {
                $preSelected = null;
            }
        }
        // preSelected is null if tag doesnt belong to user, or doesnt exist
        // null means that tag is nott preselected
        return Inertia::render("Dashboard", [
            "preSelected" => $preSelected,
            "sub_tags_enabled" => env("AISubTags", false),
        ]);
    }

    public function get_image(Picture $picture)
    {
        $SERVER_IMAGE_DISK = env("SERVER_IMAGE_DISK", "images");
        if (!Storage::disk($SERVER_IMAGE_DISK)->exists($picture->image)) {
            return response("Could not find the image on local disk", 404);
        }

        if (auth()->user()->id != $picture->user_id) {
            return response('You don\'t have the permission to view this image', 403);
        }

        return Storage::disk($SERVER_IMAGE_DISK)->response($picture->image);
    }

    public function get_thumbnail(Picture $picture)
    {
        $SERVER_THUMBNAILS_DISK = env("SERVER_THUMBNAILS_DISK", "thumbnails");
        $disk = Storage::disk($SERVER_THUMBNAILS_DISK);

        if (!$disk->exists($picture->image)) {
            return response("Could not find the image on local disk", 404);
        }

        if (!$picture->sharedImage()->first()) {
            // If image isn't shared, check if user is logged in, and if the thumb belongs to him
            // If user isn't logged in, then it does not have permission to view it.

            $user = auth()->user();
            if (!$user) {
                // isnt logged in
                return response('You don\'t have the permission to view this image', 403);
            }

            if (auth()->user()->id != $picture->user_id) {
                return response('You don\'t have the permission to view this image', 403);
            }
        }

        return $disk->response($picture->image);
    }

    public function get_meta_image($image)
    {
        $picture = Picture::where("image", $image)->first();
        if (!$picture) {
            return abort(404);
        }
        if (!$picture->sharedImage()->first()) {
            return abort(404);
        }

        // Get storages
        $SERVER_IMAGE_HALF_DISK = env("SERVER_IMAGE_HALF_DISK", "half_images");
        $disk = Storage::disk($SERVER_IMAGE_HALF_DISK);

        if (!$disk->exists($image)) {
            return abort(404);
        }
        return $disk->response($image);
    }

    public function get_half_picture(Picture $picture)
    {
        if (auth()->id() != $picture->user_id) {
            return response('You\'re not allowed to view this', 403);
        }

        // Get storages
        $SERVER_IMAGE_HALF_DISK = env("SERVER_IMAGE_HALF_DISK", "half_images");
        $disk = Storage::disk($SERVER_IMAGE_HALF_DISK);

        // If half size already exists, show it
        if ($disk->exists($picture->image)) {
            // if exists return
            return $disk->response($picture->image);
        }

        // ------ Create half size image -------

        // Get storage
        $SERVER_IMAGE_DISK = env("SERVER_IMAGE_DISK", "images");
        $imageDisk = Storage::disk($SERVER_IMAGE_DISK);

        // Check if image exists
        if (!$imageDisk->exists($picture->image)) {
            return response("Original Image does not exist!!!", 500);
        }

        // Scale down original image
        $path = $imageDisk->path($picture->image);
        $imageSize = getimagesize($path);
        $scalePercentage = env("scaledDownImages", 20); // Image is going to be n% from all the width pixels
        $resultPixels = ($scalePercentage * $imageSize[0]) / 100;

        // Initiate scaling down, and save the image
        $manager = new ImageManager(new Driver());
        $image = $manager->read($path);
        $image->scaleDown(width: $resultPixels);
        $image->save($disk->path($picture->image));

        // Return half size image
        return $disk->response($picture->image);
    }

    public function get_resized_images(Request $req, $page)
    {
        $SERVER_IMAGE_DISK = env("SERVER_IMAGE_DISK", "images");
        $SERVER_THUMBNAILS_DISK = env("SERVER_THUMBNAILS_DISK", "thumbnails");

        if ($page < 1) {
            return response()->json(["message" => "Page cannot be below 0"], 422);
        }

        // queriedTags
        $queryTags = [];

        // Check either user is querying tags or not
        $data = $req->all();
        if (isset($data["queryTags"])) {
            $queryTags = json_decode($data["queryTags"]);
        }

        // Picture per page
        $perPage = env("perPage", 40);
        $skip = ($page - 1) * $perPage;

        $pictures = $req
            ->user()
            ->picture()
            ->where(function ($query) use ($queryTags) {
                // This function searches for tags in json
                foreach ($queryTags as $tagId) {
                    $query->orWhereJsonContains("tags", $tagId);
                }
            })
            ->where("hidden", false)
            ->orderBy("created_at", "DESC")
            ->skip($skip)
            ->take($perPage)
            ->get();

        // build a return array
        $rtn_arr = [
            "totalPages" => ceil(
                $req
                    ->user()
                    ->picture()
                    ->where(function ($query) use ($queryTags) {
                        // This function searches for tags in json
                        foreach ($queryTags as $tagId) {
                            $query->orWhereJsonContains("tags", $tagId);
                        }
                    })
                    ->where("hidden", false)
                    ->count() / $perPage
            ),
            "images" => [],
        ];

        foreach ($pictures as $pic) {
            $path = Storage::disk($SERVER_IMAGE_DISK)->path($pic->image);
            $thumbDISK = Storage::disk($SERVER_THUMBNAILS_DISK);

            if (!$thumbDISK->exists($pic->image)) {
                // need to create new thumbnail and save it to the disk
                $manager = new ImageManager(new Driver());

                // Check if image's resolution is too big, then skip making thumbnail for it
                $imageSize = getimagesize($path);
                if ($imageSize[0] > 6800 || $imageSize[1] > 6800) {
                    // Add image without a thumbnail
                    $rtn_arr["images"][] = [
                        "id" => $pic->public_id,
                        "name" => $pic->image,
                        "size" => round($pic->size, 3),
                        "tags" => $pic->tags,
                        "uploaded" => $pic->created_at,
                        "shared" => $pic->sharedImage()->count() >= 1 ? true : false,
                        "uploaded_ago" => str_replace("before", "ago", $pic->created_at->diffForHumans(now())),
                        "thumb" => "data:image/webp;base64,",
                        "width" => $pic->width,
                        "height" => $pic->height,
                        "aspectRatio" => round($pic->width / $pic->height, 2),
                        "sub_tags" => json_decode($pic->sub_tags),
                    ];

                    continue;
                }

                $thumbWidth = env("thumbWidth", 40);
                $image = $manager->read($path);
                $image->scaleDown(width: $thumbWidth);

                $image->save($thumbDISK->path($pic->image)); // Save image to the local path
            }

            $rtn_arr["images"][] = [
                "id" => $pic->public_id,
                "name" => $pic->image,
                "size" => round($pic->size, 3),
                "tags" => $pic->tags,
                "shared" => $pic->sharedImage()->count() >= 1 ? true : false,
                "uploaded" => $pic->created_at,
                "uploaded_ago" => str_replace("before", "ago", $pic->created_at->diffForHumans(now())),
                "thumb" => "data:image/webp;base64," . base64_encode($thumbDISK->get($pic->image)),
                "width" => $pic->width,
                "height" => $pic->height,
                "aspectRatio" => round($pic->width / $pic->height, 2) . "/1",
                "sub_tags" => json_decode($pic->sub_tags),
            ];
        }

        return response()->json($rtn_arr);
    }

    public function upload(Request $req)
    {
        $data = $req->validate([
            "zip" => "required|file|mimes:zip|max:512000", // 500MB
            "tags" => "required|json",
        ]);

        $SERVER_TMP_ZIP_DISK = env("SERVER_TMP_ZIP_DISK", "tmp");
        $SERVER_IMAGE_DISK = env("SERVER_IMAGE_DISK", "images");
        $tmpZipFile = "";

        if ($req->file("zip")->isValid()) {
            $file = $req->file("zip");
            $tmpZipFile = Storage::disk($SERVER_TMP_ZIP_DISK)->put("", $file);
        } else {
            return response()->json(["message" => "File is not valid"], 400);
        }

        // Check if zip file exists
        if (!Storage::disk($SERVER_TMP_ZIP_DISK)->exists($tmpZipFile)) {
            // This error really shouldn't appear, but im making it just in case
            return response()->json(["message" => "Temporary zip file does not exist!"], 404);
        }

        // Open zip file
        $zipPath = Storage::disk($SERVER_TMP_ZIP_DISK)->path($tmpZipFile);

        $zip = new ZipArchive();
        $zipStatus = $zip->open($zipPath);

        // Check if zip has been opened properly
        if (!$zipStatus) {
            return response()->json(["message" => "Could not open zip file"], 500);
        }

        // get all zip file contents
        $zipFiles = [];
        for ($i = 0; $i < $zip->count(); $i++) {
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
            return response()->json(["message" => "Files exist in destination directory!"], 409);
        }

        // Extract zip file
        $success = $zip->extractTo(Storage::disk($SERVER_IMAGE_DISK)->path(""));
        if (!$success) {
            return response()->json(["message" => "Files could not be extracted!"], 500);
        }

        // close zip
        $zip->close();

        // Delete zip file
        $deleted = Storage::disk($SERVER_TMP_ZIP_DISK)->delete($tmpZipFile);
        if (!$deleted) {
            return response()->json(["message" => "Could not delete temporary zip file!"], 500);
        }

        // Check if all files are extracted successfully, and if they're then add to the database
        $allExtracted = true;
        foreach ($zipFiles as $file) {
            if (!Storage::disk($SERVER_IMAGE_DISK)->exists($file)) {
                $allExtracted = false;
                continue;
            }

            $pictureSize = getimagesize(Storage::disk($SERVER_IMAGE_DISK)->path($file));
            $id = $req
                ->user()
                ->picture()
                ->create([
                    "image" => $file,
                    "tags" => json_decode($data["tags"]), // tag ids
                    "size" => Storage::disk($SERVER_IMAGE_DISK)->size($file) / 1048576, // convert to MB
                    "width" => $pictureSize[0],
                    "height" => $pictureSize[1],
                ]);

            if (!$id) {
                // check if database record was created successfully
                return response()->json(["message" => "Could not create a database record!"], 500);
            }
        }

        if (!$allExtracted) {
            return response()->json(["message" => "Not all files could be extracted successfully!"], 500);
        }

        return response()->json(["message" => "All images were uploaded successfully"], 201);
    }

    public function edit_tags(Picture $picture, Request $req)
    {
        $validator = Validator::make($req->all(), [
            "tags" => "required|array",
        ]);

        if (auth()->user()->id != $picture->user_id) {
            return response('You don\'t have the permission to view this image', 403);
        }

        if ($validator->fails()) {
            return response()->json($validator->messages(), 400);
        } else {
            //process the request
            $data = $validator->valid(); // validated data
            $picture->tags = $data["tags"];

            if ($picture->save()) {
                return response("saved");
            }
        }

        return response('Something went wrong, and couln\'dnt save tags', 500);
    }

    function delete_picture(Picture $picture)
    {
        $SERVER_THUMBNAILS_DISK = env("SERVER_THUMBNAILS_DISK", "thumbnails");
        $SERVER_IMAGE_DISK = env("SERVER_IMAGE_DISK", "images");

        Storage::disk($SERVER_IMAGE_DISK)->delete($picture->image);
        Storage::disk($SERVER_THUMBNAILS_DISK)->delete($picture->image);

        if (auth()->user()->id != $picture->user_id) {
            return response('You don\'t have the permission to view this image', 403);
        }

        $picture->delete();

        return response("Picture deleted");
    }

    function delete_pictures(Request $req)
    {
        // TODO: Change api to use this

        try {
            $data = ValidateApi::validate($req, ["pictures" => "required|array"]);
        } catch (Exception $err) {
            return response()->json($err->getMessage(), $err->getCode());
        }

        $user = auth()->user();

        // TODO: Replace old disks and images
        $images = Disks::image();
        $half = Disks::half();
        $thumb = Disks::thumb();

        foreach ($data["pictures"] as $picId) {
            $pic = $user->picture()->where("public_id", $picId)->first();
            if (!$pic) {
                continue;
            }

            $path = $pic->image;

            try {
                $pic->delete();
                $images->delete($path);
                $half->delete($path);
                $thumb->delete($path);
            } catch (Exception $e) {
                return response($e->getMessage(), $e->getCode());
            }
        }

        return;
    }

    public function download_image(Picture $picture)
    {
        $userId = auth()->id();
        if ($userId !== $picture->user_id) {
            return abort(404);
        }

        $disk = Disks::image();
        if ($picture->hidden) {
            if (!Encrypt::authorized()) {
                return response("Not authorized", 403);
            }

            $decryptedFile = Encrypt::decrypt($disk, $picture->image, session("pin"));

            return response()->streamDownload(function () use ($decryptedFile) {
                echo $decryptedFile;
            }, $picture->image);
        }
        return $disk->download($picture->image);
    }

    public function download_multiple_images($ids)
    {
        $validator = Validator::make(
            ["ids" => json_decode($ids)],
            [
                "ids" => ["required", "array"],
            ]
        );

        if ($validator->fails()) {
            return response()->json($validator->messages(), 422);
        }

        $data = $validator->validated();
        $user = auth()->user();

        $imageDisk = Disks::image();
        $tmp = Disks::tmp();
        $zip = new ZipArchive();
        $zipName = $user->username . "_pictures_" . date(now()) . ".zip";

        if ($zip->open($tmp->path($zipName), ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            foreach ($data["ids"] as $id) {
                $picture = Picture::where("public_id", $id)->first();

                // Check if picture belongs to user
                if ($picture->user_id !== $user->id) {
                    $zip->close();
                    $tmp->delete($zipName);
                    return abort(403);
                }

                // Check if picture exists on the disk
                if (!$imageDisk->exists($picture->image)) {
                    continue;
                }

                $zip->addFile($imageDisk->path($picture->image), $picture->image);
            }

            // Close the archive
            $zip->close();
            return response()->download($tmp->path($zipName))->deleteFileAfterSend(true);
        } else {
            return response()->json(["error" => "Unable to create ZIP archive"], 500);
        }
    }
}
