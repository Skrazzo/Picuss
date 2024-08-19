<?php

namespace App\Http\Controllers;

use App\Models\Picture;
use App\Models\ShareImages;
use App\Models\ShareTags;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;

class ShareImagesController extends Controller
{
    public function create(Request $req)
    {
        $validator = Validator::make($req->all(), [
            "imageId" => "required|exists:pictures,public_id",
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        }

        //process the request
        $data = $validator->valid(); // validated data
        $picture = Picture::where("public_id", $data["imageId"])->first();

        // Check security
        if (auth()->user()->id != $picture->user_id) {
            return response('You don\'t have the permission to view this image', 403);
        }

        // Sending back data
        $response = [
            "message" => "",
            "title" => "",
            "public" => false,
        ];

        if ($picture->sharedImage()->count() >= 1) {
            $picture->sharedImage()->delete();

            $response["title"] = "Revoked access";
            $response["message"] = "Your image is not publicly accessible anymore";
        } else {
            $shared = $picture->sharedImage()->create([
                "user_id" => auth()->id(),
            ]);

            if ($shared) {
                $response["title"] = "Granted access";
                $response["message"] = "Your image is now publicly accessible to anyone";
                $response["public"] = true;
                $response["link"] = route("share.image.page", $shared->picture_id);
            }
        }

        return response()->json($response);
    }

    public function view(Picture $picture)
    {
        $share = $picture->sharedImage()->first();
        if (!$share) {
            return abort(404);
        }

        $SERVER_THUMBNAILS_DISK = env("SERVER_THUMBNAILS_DISK", "thumbnails");
        $thumbDisk = Storage::disk($SERVER_THUMBNAILS_DISK);

        $share->views = $share->views + 1;
        $share->save();

        $username = User::where("id", $picture->user_id)
            ->select("username")
            ->first()["username"];
        if (empty($username)) {
            $username = "User";
        }

        return Inertia::render("ViewSharedImage", [
            "thumb" => "data:image/webp;base64," . base64_encode($thumbDisk->get($picture->image)),
            "picture" => [
                "id" => $picture->public_id,
                "size" => round($picture->size, 3),
                "aspectRatio" => round($picture->height / $picture->width, 3),
                "name" => $picture->image,
                "width" => $picture->width,
                "height" => $picture->height,
            ],
            "meta" => [
                "og:title" => $picture->image,
                "og:description" => $username . " shared picture with you",
                "og:type" => "website",
                "og:image" => route("get.meta.image", $picture->image),
                "og:url" => url()->current(),
            ],
            "title" => "Shared image",
        ]);
    }

    public function get(Picture $picture)
    {
        if ($picture->sharedImage()->count() == 0) {
            return abort(404);
        }

        $SERVER_IMAGE_DISK = env("SERVER_IMAGE_DISK", "images");
        $imageDisk = Storage::disk($SERVER_IMAGE_DISK);

        if (!$imageDisk->exists($picture->image)) {
            return response("Could not find the image on local disk", 404);
        }

        return $imageDisk->response($picture->image);
    }

    // This is being used by shared tags index view
    public function get_half(Picture $picture)
    {
        // Check if pictures tags are shared
        $tags = $picture->tags;
        $shared = false;

        // Go through every tag that image owns, and check if any of them are shared
        foreach ($tags as $tag) {
            if (ShareTags::where("tags_id", $tag)->first()) {
                $shared = true;
                break;
            }
        }

        if (!$shared) {
            return abort(404);
        }

        $halfEnv = env("SERVER_IMAGE_HALF_DISK", "half_images");
        $disk = Storage::disk($halfEnv);

        // Check if half size already exists, show it
        if ($disk->exists($picture->image)) {
            // if exists return
            return $disk->response($picture->image);
        }

        // ----- Create half sized image --------

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

        return $disk->response($picture->image);
    }

    public function download(Picture $picture)
    {
        $share = $picture->sharedImage()->first();
        if (!$share) {
            // Check if pictures tags are shared or not
            $tags = $picture->tags;
            $shared = false;

            foreach ($tags as $tag) {
                if (ShareTags::where("tags_id", $tag)->first()) {
                    $shared = true;
                    break;
                }
            }

            if (!$shared) {
                return abort(404);
            }
        }

        $SERVER_IMAGE_DISK = env("SERVER_IMAGE_DISK", "images");
        $imageDisk = Storage::disk($SERVER_IMAGE_DISK);

        if ($share) {
            $share->downloads = $share->downloads + 1;
            $share->save();
        }

        if ($imageDisk->exists($picture->image)) {
            return response()->download($imageDisk->path($picture->image));
        }

        return abort(404);
    }

    public function manage_index()
    {
        $userId = auth()->id();
        $pictures = ShareImages::where("user_id", $userId)->get();
        $tags = ShareTags::with("tag:id,name")->where("user_id", $userId)->get();

        return Inertia::render("ManageLinks", [
            "links" => [
                "pictures" => $pictures,
                "tags" => $tags,
            ],
            "title" => "Manage links",
        ]);
    }

    public function delete(Request $req)
    {
        $validator = Validator::make($req->all(), [
            "images" => "required|array",
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        }
        $data = $validator->valid(); // validated data

        $images = ShareImages::whereIn("picture_id", $data["images"])
            ->where("user_id", auth()->id())
            ->delete();

        if ($images == count($data["images"])) {
            return response("OK");
        }
        return response("Something went wrong", 500);
    }
}
