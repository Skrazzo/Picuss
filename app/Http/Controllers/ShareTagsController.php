<?php

namespace App\Http\Controllers;

use App\Models\Picture;
use App\Models\ShareTags;
use App\Models\Tags;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ShareTagsController extends Controller
{
    public function view(ShareTags $tag)
    {
        $tag->views = $tag->views + 1;
        $tag->save();

        $tagName = $tag->tag()->value("name");
        $username = User::find($tag->tag()->value("user_id"))->first()["username"];

        $pictureCount = Picture::whereJsonContains("tags", $tag->tags_id)
            ->where("hidden", false)
            ->count();

        return Inertia::render("Components/SharedTagView/Index", [
            "title" => "Shared images",
            "id" => $tag->tag_public_id,
            "db_id" => $tag->tag()->first()->id,
            "meta" => [
                "og:title" => "Picuss - " . $tagName,
                "og:description" =>
                    $username .
                    " shared \"" .
                    $tagName .
                    "\" tag with " .
                    $pictureCount .
                    " pictures. Open url to view them.",
                "og:type" => "website",
                "og:image" => asset("favicon.ico"),
                "og:url" => url()->current(),
            ],
        ]);
    }

    public function get(ShareTags $tag, $page)
    {
        $allDBPictures = Picture::whereJsonContains("tags", $tag->tags_id)->get();

        $pictureCount = $allDBPictures->count();
        $size = round($allDBPictures->sum("size"), 3); // All image size

        $perPage = env("perPage", 40);
        $maxPages = ceil($pictureCount / $perPage);

        // Check for pages
        if ($page < 1 || $page > $maxPages) {
            return response("Too many pages requsted", 404);
        }

        // Get pages
        $DBpictures = Picture::whereJsonContains("tags", $tag->tags_id)
            ->where("hidden", false)
            ->orderBy("created_at", "DESC")
            ->skip($perPage * ($page - 1))
            ->take($perPage)
            ->get();

        // Get thumbnail disk
        $thumbEnv = env("SERVER_THUMBNAILS_DISK", "thumbnails");
        $thumbDisk = Storage::disk($thumbEnv);

        // Filter pictures, and return only needed information
        $pictures = [];
        foreach ($DBpictures as $pic) {
            // Get thumbnail for the picture
            $thumb = "data:image/webp;base64";
            if ($thumbDisk->exists($pic->image)) {
                $thumb = "data:image/webp;base64," . base64_encode($thumbDisk->get($pic->image));
            }

            $pictures[] = [
                "id" => $pic->public_id,
                "size" => round($pic->size, 3),
                "width" => $pic->width,
                "height" => $pic->height,
                "name" => $pic->image,
                "thumb" => $thumb,
            ];
        }

        // Download settings
        $maxZipSize = env("maxZipSize", 25);
        $download = [
            "allowed" => $size > $maxZipSize ? false : true,
            "size" => $size,
            "limit" => $maxZipSize,
        ];
        $info = [
            "owner" => User::find($tag->user_id)->first()["username"],
            "tag_name" => $tag->tag()->first("name")->name,
        ];

        return compact("pictureCount", "maxPages", "pictures", "download", "info");
    }

    public function shareTags(Request $req)
    {
        $validator = Validator::make($req->all(), [
            "tags" => "required|array",
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        }

        //process the request
        $data = $validator->valid(); // validated data

        // $id => tag id
        foreach ($data["tags"] as $id) {
            $tag = Tags::find($id);

            // Check if tag exists and belongs to a user
            if (!$tag) {
                continue;
            }
            if ($tag->user_id !== auth()->id()) {
                continue;
            }
            if ($tag->share()->first()) {
                continue;
            } // Share already exists

            $tag->share()->create(["user_id" => auth()->id()]);
        }
    }

    public function unshareTags(Request $req)
    {
        $validator = Validator::make($req->all(), [
            "tags" => "required|array",
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        }

        //process the request
        $data = $validator->valid(); // validated data

        // $id => tag id
        foreach ($data["tags"] as $id) {
            $tag = ShareTags::where("tag_public_id", $id)->first();

            // Check if tag exists and belongs to a user
            if (!$tag) {
                continue;
            }
            if ($tag->user_id !== auth()->id()) {
                continue;
            }
            $tag->delete();
        }
    }

    public function get_full_image(Picture $picture)
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

        $imageEnv = env("SERVER_IMAGE_DISK", "images");
        $disk = Storage::disk($imageEnv);

        // Check if half size already exists, show it
        if ($disk->exists($picture->image)) {
            // if exists return
            return $disk->response($picture->image);
        }
    }

    public function download(Tags $tag)
    {
        if (auth()->check()) {
            // User is logged in
            if ($tag->user_id !== auth()->id()) {
                // User does not own the tag
                return abort(404);
            }

            // Proceed to download
        } else {
            // User is not logged in
            // Check if tag is shared
            if (!$tag->share()->first()) {
                return abort(404);
            }

            // Proceed to download
        }

        // Get picture names and check server limit
        $pictures = Picture::whereJsonContains("tags", $tag->id)
            ->where("hidden", false)
            ->get();

        if ($pictures->count() === 0) {
            return abort(404);
        }

        $sizeLimit = env("maxZipSize", 25);

        if ($pictures->sum("size") > $sizeLimit) {
            return response("Files exceed server zip limit of " . $sizeLimit . " MB, and cannot be downloaded", 403);
        }

        // Get storage
        $tmpEnv = env("SERVER_TMP_ZIP_DISK", "tmp");
        $tmpDisk = Storage::disk($tmpEnv);

        $imageEnv = env("SERVER_IMAGE_DISK", "images");
        $imageDisk = Storage::disk($imageEnv);

        // Create zip
        $zip = new \ZipArchive();
        $fileName = $tmpDisk->path($tag->name . "_" . time() . ".zip");

        if ($zip->open($fileName, \ZipArchive::CREATE) === true) {
            // Add files to the zip
            foreach ($pictures as $pic) {
                if ($imageDisk->exists($pic->image)) {
                    $file = $imageDisk->path($pic->image);
                    $zip->addFile($file, basename($file));
                }
            }

            $zip->close();
        }

        // Add download count
        $shared = $tag->share()->first();
        if ($shared) {
            $shared->downloads = $shared->downloads + 1;
            $shared->save();
        }

        return response()->download($fileName)->deleteFileAfterSend(true);
    }

    public function shareImages(Request $req)
    {
        $validator = Validator::make($req->all(), [
            "pictures" => "required|array",
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        }

        //process the request
        $data = $validator->valid(); // validated data
        $user = auth()->user();

        // Generate new name for the tag, and ensure it's unique
        $newTag = $this->generateRandomTag();
        while ($user->tag()->where("name", $newTag)->first()) {
            $newTag = $this->generateRandomTag();
        }

        // Create new tag for user, and add it to the selected images, then add tag to the shared tags
        $tag = $user->tag()->create(["name" => $newTag]);

        foreach ($data["pictures"] as $picId) {
            $pic = $user->picture()->where("public_id", $picId)->first();
            if (!$pic) {
                continue;
            }

            $tmp = $pic["tags"];
            $tmp[] = $tag->id;
            $pic["tags"] = $tmp;

            if (!$pic->save()) {
                return response("Could not add shared tag to the picture " . $pic["image"], 500);
            }
        }

        $tag->share()->create(["user_id" => $user->id]);

        return response()->json(["count" => count($data["pictures"]), "tagName" => $tag->name]);
    }

    function generateRandomTag($length = 15)
    {
        $prefix = "shared-";
        $maxLength = $length - strlen($prefix);

        // Ensure the random part won't exceed the remaining length
        $randomPart = substr(bin2hex(random_bytes($maxLength / 2)), 0, $maxLength);

        return $prefix . $randomPart;
    }
}
